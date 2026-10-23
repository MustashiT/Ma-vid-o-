# Fortnite edit replicating reference: saturated square gameplay -> B&W freeze on the kill + 💀 -> fade to black
import numpy as np, cv2, subprocess, sys
SRC=sys.argv[1]; OUT=sys.argv[2]; PREVIEW=sys.argv[3] if len(sys.argv)>3 else None
FPS=30; W,H=1080,1920; SQ=1080
raw=subprocess.run(['ffmpeg','-v','error','-i',SRC,'-f','rawvideo','-pix_fmt','bgr24','-'],capture_output=True).stdout
V=np.frombuffer(raw,np.uint8).reshape(-1,720,1280,3)
def fr(t): return V[min(len(V)-1,max(0,int(round(t*30))))]
# timings measured on the reference (13.03 s): action 0-8.80, freeze 8.80-12.10, fade 12.10-12.60, black to end
T_FRZ,T_FADE0,T_FADE1,END=8.80,12.10,12.60,13.033
S0,KILL=2.05,11.56          # source: start of action, frame where the "K-O !" banner is up
CX,CY,CS=350,52,580        # square crop on the player/crosshair, HUD out
sk=cv2.imread('skull2.png',cv2.IMREAD_UNCHANGED); SKS=96
sk=cv2.resize(sk,(SKS,SKS),interpolation=cv2.INTER_AREA); SKA=sk[...,3:4]/255.0; SKC=sk[...,:3].astype(float)
def grade(img):
    f=img.astype(np.float32)/255
    f=np.clip((f-0.5)*1.12+0.5+0.04,0,1)
    g=f.mean(2,keepdims=True); f=np.clip(g+(f-g)*1.55,0,1)
    return f
def render(i):
    t=i/FPS
    frz=t>=T_FRZ
    src=KILL if frz else S0+(KILL-S0)*t/T_FRZ
    sq=fr(src)[CY:CY+CS,CX:CX+CS]
    sq=cv2.resize(sq,(SQ,SQ),interpolation=cv2.INTER_CUBIC)
    sq=cv2.filter2D(sq,-1,np.array([[0,-0.4,0],[-0.4,2.6,-0.4],[0,-0.4,0]],np.float32))
    f=grade(sq)
    if frz:
        g=f.mean(2,keepdims=True); g=np.clip((g-0.5)*1.25+0.55,0,1); f=np.repeat(g,3,2)
        if t>=T_FRZ+2/FPS:
            y0=int(SQ*0.53)-SKS//2; x0=SQ//2-SKS//2
            f[y0:y0+SKS,x0:x0+SKS]=f[y0:y0+SKS,x0:x0+SKS]*(1-SKA)+SKC/255*SKA
    # 9:16 canvas: blurred, darkened copy behind the square
    bg=cv2.resize(f,(SQ//8,SQ//8)); bg=cv2.GaussianBlur(bg,(0,0),3); bg=cv2.resize(bg,(H,H))[:,(H-W)//2:(H-W)//2+W]*0.55
    out=bg.copy(); y=(H-SQ)//2; out[y:y+SQ]=f
    a=1.0 if t<T_FADE0 else max(0.0,1-(t-T_FADE0)/(T_FADE1-T_FADE0))
    return (np.clip(out*a,0,1)*255).astype(np.uint8)
N=int(round(END*FPS))
if PREVIEW:
    for i in map(int,PREVIEW.split(',')): cv2.imwrite(f'p4_{i:03d}.jpg',cv2.resize(render(i),(270,480)))
    sys.exit()
p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgr24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-i','ref.wav',
  '-map','0:v','-map','1:a','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','-shortest','-movflags','+faststart',OUT],stdin=subprocess.PIPE)
for i in range(N): p.stdin.write(render(i).tobytes())
p.stdin.close(); p.wait(); print('done')
