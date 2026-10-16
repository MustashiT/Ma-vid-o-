# Original phonk beat synth (royalty-free) — 130 BPM, F minor
import numpy as np, json, sys
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile
SR=44100; BPM=130; B=60/BPM; STEP=B/4; BAR=4*B
NBARS=10; DUR=NBARS*BAR
N=int(DUR*SR)+SR
rng=np.random.default_rng(7)
def buf(): return np.zeros(N)
def env_exp(n,tau): return np.exp(-np.arange(n)/(tau*SR))
def place(dst,sig,t,g=1.0):
    i=int(round(t*SR)); j=min(N,i+len(sig))
    if i<N: dst[i:j]+=g*sig[:j-i]
def bp(x,lo,hi,o=2): return sosfilt(butter(o,[lo,hi],'band',fs=SR,output='sos'),x)
def lp(x,f,o=2): return sosfilt(butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,'high',fs=SR,output='sos'),x)
def reverb(x,dur=2.2,mix=0.3,seed=1):
    r=np.random.default_rng(seed); n=int(dur*SR)
    ir=r.standard_normal(n)*np.exp(-np.arange(n)/(dur/6.9*SR)); ir=lp(ir,6000); ir/=np.sqrt((ir**2).sum())
    return x+mix*fftconvolve(x,ir)[:len(x)]
def st(f0,semi): return f0*2**(semi/12)

# ---- instruments
def cowbell(f,dur=0.32):
    n=int(dur*SR); t=np.arange(n)/SR
    sq=lambda fr: np.sign(np.sin(2*np.pi*fr*t))
    s=0.6*sq(f)+0.4*sq(f*1.4836)
    s=bp(s,f*0.8,min(f*4,15000),2)
    e=np.where(t<0.012, np.exp(-t/0.02), np.exp(-0.012/0.02)*np.exp(-(t-0.012)/0.11))
    return s*e*np.exp(-t/0.6)
def kick():
    n=int(0.45*SR); t=np.arange(n)/SR
    f=45+110*np.exp(-t/0.03); ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)*np.exp(-t/0.18); s+=0.5*np.exp(-t/0.003)*rng.standard_normal(n)*0.3
    return np.tanh(2.2*s)
def bass808(f,dur,glide_to=None):
    n=int(dur*SR); t=np.arange(n)/SR
    fr=f*(1+1.2*np.exp(-t/0.02))
    if glide_to: fr=fr+(glide_to-f)*np.clip((t-dur*0.55)/(dur*0.3),0,1)
    s=np.sin(2*np.pi*np.cumsum(fr)/SR)
    e=np.minimum(1,t/0.004)*np.exp(-t/1.6); e*=np.clip((dur-t)/0.02,0,1)
    return np.tanh(3.2*s*e)*0.9
def clap():
    n=int(0.5*SR); t=np.arange(n)/SR; nz=rng.standard_normal(n)
    e=np.zeros(n)
    for d in (0,0.011,0.022): e+=np.where(t>=d,np.exp(-(t-d)/0.008),0)
    e+=np.where(t>=0.03,np.exp(-(t-0.03)/0.13),0)
    s=bp(nz,900,7000)*e + 0.4*np.sin(2*np.pi*190*t)*np.exp(-t/0.05)
    return np.tanh(1.8*s)
def hat(open_=False):
    n=int((0.35 if open_ else 0.06)*SR); t=np.arange(n)/SR
    s=hp(rng.standard_normal(n),7500,4)*np.exp(-t/(0.12 if open_ else 0.014))
    return s
def pad(freqs,dur):
    n=int(dur*SR); t=np.arange(n)/SR; s=np.zeros(n)
    for f in freqs:
        for d in (-0.12,0,0.12):
            ph=2*np.pi*f*2**(d/12)*t+0.003*np.sin(2*np.pi*5*t)*f
            s+=2*(ph/(2*np.pi)%1)-1
    s=lp(s,900,4); a=np.minimum(1,t/0.8)*np.minimum(1,(dur-t)/0.3)
    return s*a/len(freqs)/3
def choir(freqs,dur):  # eerie "frisson" voice
    n=int(dur*SR); t=np.arange(n)/SR; s=np.zeros(n)
    for f in freqs:
        vib=1+0.006*np.sin(2*np.pi*5.2*t)
        ph=2*np.pi*np.cumsum(f*vib)/SR
        s+=np.sin(ph)+0.35*np.sin(2*ph)+0.2*np.sin(3*ph)
    s=bp(s,300,3200); a=np.minimum(1,t/1.0)*np.minimum(1,(dur-t)/0.4)
    return s*a/len(freqs)
def riser(dur):
    n=int(dur*SR); t=np.arange(n)/SR; x=rng.standard_normal(n); out=np.zeros(n)
    seg=2048
    for i in range(0,n,seg):
        fc=300+9000*(i/n)**2; out[i:i+seg]=bp(x[i:i+seg+0],fc*0.7,min(fc*1.4,20000),2)[:len(out[i:i+seg])]
    return out*(t/dur)**2
def impact():
    n=int(2.2*SR); t=np.arange(n)/SR
    sub=np.sin(2*np.pi*np.cumsum(30+60*np.exp(-t/0.15))/SR)*np.exp(-t/0.9)
    nz=lp(rng.standard_normal(n),2500)*np.exp(-t/0.25)
    return np.tanh(1.5*(sub+0.6*nz))

F4=349.23; F1=43.65
mel=[{0:12,3:10,6:7,8:8,10:7,12:3,14:2},{0:12,3:10,6:7,8:8,10:7,11:8,12:10,14:7}]
roots=[0,-4,-2,-5]  # F, Db, Eb, C (semitones from F)
L={k:buf() for k in ['cow','kick','bass','clap','hat','pad','fx']}
DROP=2*BAR
events={'bpm':BPM,'drop':DROP,'kicks':[],'snares':[],'bar':BAR,'dur':NBARS*BAR}
for b in range(NBARS):
    t0=b*BAR; drop=b>=2; last=b==NBARS-1
    for s,semi in mel[b%2].items():
        f=st(F4,semi)
        g=0.55 if drop else 0.45
        if last and s>=8: continue
        place(L['cow'],cowbell(f),t0+s*STEP,g)
    if drop:
        r=st(F1,roots[(b-2)%4])
        kpat=[0,6,10] if b%2==0 else [0,6,10,14]
        if last: kpat=[0,6]
        for i,s in enumerate(kpat):
            t=t0+s*STEP; place(L['kick'],kick(),t,1.0); events['kicks'].append(t)
            nxt=(kpat[i+1] if i+1<len(kpat) else 16)
            d=(nxt-s)*STEP
            glide=r*2 if (s==10 and b%4==3) else None
            if last and s==6: d=BAR*0.6; glide=r/2
            place(L['bass'],bass808(r if s!=6 else r*2**(3/12),d,glide),t,0.85)
        for s in (4,12):
            if last and s==12: continue
            place(L['clap'],clap(),t0+s*STEP,0.75); events['snares'].append(t0+s*STEP)
        for s in range(0,16,2):
            if last and s>=8: break
            place(L['hat'],hat(s%8==6),t0+s*STEP,0.35 if s%4 else 0.22)
        if b in (4,5,8):  # triplet/32nd rolls
            for k in range(6): place(L['hat'],hat(),t0+14*STEP+k*STEP/3,0.25+0.04*k)
    else:
        # intro: hats sparse in bar 2
        if b==1:
            for s in range(0,12,2): place(L['hat'],hat(),t0+s*STEP,0.12)
# pad + choir
for b in range(NBARS):
    r=roots[(max(b-2,0))%4] if b>=2 else 0
    chord=[st(F4/2,r),st(F4/2,r+3),st(F4/2,r+7)]
    place(L['pad'],pad(chord,BAR+0.3),b*BAR,0.5 if b<2 else 0.35)
place(L['pad'],choir([st(F4,0),st(F4,3),st(F4,7),st(F4,12)],2*BAR),0,0.45)
place(L['pad'],choir([st(F4,3),st(F4,7),st(F4,10),st(F4,15)],2*BAR),6*BAR,0.28)
# FX: riser into drop, gap, impact on drop, impacts at kill markers (passed in)
place(L['fx'],riser(BAR*1.0),DROP-BAR*1.0-B*0.25,0.35)
place(L['fx'],impact(),DROP,1.0)
extra=json.loads(sys.argv[1]) if len(sys.argv)>1 else []
for t in extra: place(L['fx'],impact()*0.55,t,1.0)
# sidechain
ke=np.zeros(N)
for t in events['kicks']:
    i=int(t*SR); n=int(0.25*SR); seg=1-0.75*np.exp(-np.arange(n)/(0.07*SR))
    j=min(N,i+n); ke[i:j]=np.minimum(ke[i:j] if ke[i:j].any() else 1,seg[:j-i])
ke[ke==0]=1
# intro filter on cowbell (underwater)
cow=L['cow'].copy(); iD=int(DROP*SR)
cow[:iD]=lp(cow[:iD],1400,2)*1.6
cow=reverb(cow,1.6,0.35,2)
mix=(cow*ke*0.9 + L['kick']*1.0 + L["bass"]*0.75 + reverb(L['clap'],1.2,0.25,3)*0.8
     + L['hat']*0.7 + reverb(L['pad'],3.0,0.5,4)*ke*0.8 + L['fx']*0.8)
# silence gap one beat... last half-beat before drop
g0=int((DROP-B*0.5)*SR); mix[g0:iD]*=np.linspace(1,0.05,iD-g0)**0.5
mix=mix[:int(DUR*SR)]
mix=np.tanh(1.3*mix/np.max(np.abs(mix)))
mix/=np.max(np.abs(mix)); mix*=0.93
fo=int(0.03*SR); mix[-fo:]*=np.linspace(1,0,fo)
stereo=np.stack([mix,np.roll(reverb(mix,0.03,0.0)*1,7)],1)
# subtle width: hats/cowbell haas
wavfile.write('music.wav',SR,(stereo*32767).astype(np.int16))
json.dump(events,open('events.json','w'),indent=1)
print('ok',DUR)
