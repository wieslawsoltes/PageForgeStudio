/** Instanced rectangle compositor. All layout and hit testing stay in the native DOM. */
export class OverlayRenderer {
  constructor(canvas,onState=()=>{}){this.canvas=canvas;this.onState=onState;this.mode='initializing';this.instances=new Float32Array(8192*8);this.capacity=8192;this.count=0;this.disposed=false;this.width=1;this.height=1;this.lastSubmissionMs=0;}
  async init(){try{
    if(!navigator.gpu)throw new Error('WebGPU is unavailable');
    const adapter=await navigator.gpu.requestAdapter({powerPreference:'low-power'});if(!adapter)throw new Error('No WebGPU adapter');
    this.device=await adapter.requestDevice();if(this.disposed){this.device.destroy();return;}
    this.device.addEventListener('uncapturederror',e=>{console.warn('PageForge WebGPU:',e.error.message);this.fallback(e.error.message);});
    this.device.lost.then(info=>{if(!this.disposed)this.fallback('Device lost: '+info.reason);});
    this.context=this.canvas.getContext('webgpu');if(!this.context)throw new Error('WebGPU canvas context is unavailable');
    const format=navigator.gpu.getPreferredCanvasFormat();this.context.configure({device:this.device,format,alphaMode:'premultiplied'});
    const shader=this.device.createShaderModule({label:'PageForge instanced rectangles',code:`
struct Viewport { size: vec2f, padding: vec2f };
@group(0) @binding(0) var<uniform> viewport: Viewport;
struct VertexOutput { @builtin(position) position: vec4f, @location(0) color: vec4f };
@vertex fn vertexMain(@builtin(vertex_index) vertex: u32, @location(0) rect: vec4f, @location(1) color: vec4f) -> VertexOutput {
  let corners = array<vec2f,6>(vec2f(0,0),vec2f(1,0),vec2f(0,1),vec2f(0,1),vec2f(1,0),vec2f(1,1));
  let p = rect.xy + corners[vertex] * rect.zw;
  var output: VertexOutput;
  output.position = vec4f(p.x / viewport.size.x * 2.0 - 1.0, 1.0 - p.y / viewport.size.y * 2.0, 0, 1);
  output.color = vec4f(color.rgb * color.a, color.a);
  return output;
}
@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4f { return input.color; }
`});
    const info=await shader.getCompilationInfo();const errors=info.messages.filter(m=>m.type==='error');if(errors.length)throw new Error(errors.map(e=>e.message).join('\n'));
    this.pipeline=await this.device.createRenderPipelineAsync({label:'Editor overlay pipeline',layout:'auto',vertex:{module:shader,entryPoint:'vertexMain',buffers:[{arrayStride:32,stepMode:'instance',attributes:[{shaderLocation:0,offset:0,format:'float32x4'},{shaderLocation:1,offset:16,format:'float32x4'}]}]},fragment:{module:shader,entryPoint:'fragmentMain',targets:[{format,blend:{color:{srcFactor:'one',dstFactor:'one-minus-src-alpha'},alpha:{srcFactor:'one',dstFactor:'one-minus-src-alpha'}}}]},primitive:{topology:'triangle-list'}});
    this.buffer=this.device.createBuffer({label:'Overlay instances',size:this.instances.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});
    this.uniform=this.device.createBuffer({size:16,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
    this.bindGroup=this.device.createBindGroup({layout:this.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:this.uniform}}]});
    this.mode='WebGPU';this.onState(this.mode,adapter.info?.description||'Instanced WGSL renderer');this.draw();
  }catch(error){this.fallback(error.message);}}
  fallback(reason){if(this.disposed||this.mode==='Canvas 2D')return;try{this.context?.unconfigure?.();}catch{}const old=this.canvas;this.canvas=old.cloneNode(false);old.replaceWith(this.canvas);this.ctx=this.canvas.getContext('2d');this.mode='Canvas 2D';this.onState(this.mode,reason);this.draw();}
  resize(width,height){this.width=Math.max(1,width);this.height=Math.max(1,height);const dpr=Math.min(window.devicePixelRatio||1,3);const w=Math.max(1,Math.round(width*dpr)),h=Math.max(1,Math.round(height*dpr));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.dpr=dpr;}
  begin(){this.count=0;}
  rect(x,y,w,h,color){if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0||this.count>=this.capacity)return;const i=this.count++*8;this.instances.set([x,y,w,h,...color],i);}
  border(r,color=[.16,.38,.9,1],thickness=1){this.rect(r.x,r.y,r.width,thickness,color);this.rect(r.x,r.y+r.height-thickness,r.width,thickness,color);this.rect(r.x,r.y,thickness,r.height,color);this.rect(r.x+r.width-thickness,r.y,thickness,r.height,color);}
  draw(){if(this.disposed)return;const start=performance.now();if(this.mode==='WebGPU'){try{this.device.queue.writeBuffer(this.uniform,0,new Float32Array([this.width,this.height,0,0]));if(this.count)this.device.queue.writeBuffer(this.buffer,0,this.instances,0,this.count*8);const encoder=this.device.createCommandEncoder();const pass=encoder.beginRenderPass({colorAttachments:[{view:this.context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:'clear',storeOp:'store'}]});if(this.count){pass.setPipeline(this.pipeline);pass.setBindGroup(0,this.bindGroup);pass.setVertexBuffer(0,this.buffer);pass.draw(6,this.count);}pass.end();this.device.queue.submit([encoder.finish()]);}catch(e){this.fallback(e.message);}}else if(this.mode==='Canvas 2D'&&this.ctx){const ctx=this.ctx;ctx.setTransform(this.dpr||1,0,0,this.dpr||1,0,0);ctx.clearRect(0,0,this.width,this.height);for(let j=0;j<this.count;j++){const i=j*8,a=this.instances;ctx.fillStyle=`rgba(${a[i+4]*255},${a[i+5]*255},${a[i+6]*255},${a[i+7]})`;ctx.fillRect(a[i],a[i+1],a[i+2],a[i+3]);}}this.lastSubmissionMs=performance.now()-start;}
  dispose(){this.disposed=true;this.buffer?.destroy();this.uniform?.destroy();this.device?.destroy();}
}
