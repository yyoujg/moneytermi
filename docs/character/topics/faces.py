import cv2,numpy as np,json
HEADS={'a':{'basics':(115,235),'corporate':(555,300),'investment':(835,255),'stocks-bonds':(1225,240),'fiscal':(1665,355)},
'b':{'household':(240,370),'inflation':(560,270),'growth':(880,215),'labor':(1285,265),'monetary':(1600,335)},
'c':{'fx':(165,245),'trade':(545,245),'global':(930,245),'stability':(1255,245),'payments':(1575,250)}}
refs = np.array([[255,255,255],[106,118,134],[222,236,244],[7,8,9],[136,182,215],[66,71,74],[120,140,165]])
R=65
def feats(im,cx,cy):
    crop=im[cy-R:cy+R,cx-R:cx+R].astype(np.int32)
    cls=((crop[:,:,None,:]-refs[None,None])**2).sum(-1).argmin(-1)
    blk=(cls==3).astype(np.uint8)
    n,lab,st,cen=cv2.connectedComponentsWithStats(blk,8)
    out=[]
    for i in range(1,n):
        x,y,w,h,a=st[i]
        if a<15 or a>900 or w>45 or h>40: continue
        if x==0 or y==0 or x+w>=2*R or y+h>=2*R: continue
        # inside fur: dilated ring mostly non-white
        m=(lab==i).astype(np.uint8); ring=cv2.dilate(m,np.ones((9,9)))-m
        if (cls[ring>0]==0).mean()>0.02: continue
        out.append([int(x),int(y),int(w),int(h),int(a),i])
    return crop,lab,out
if __name__=='__main__':
    tiles=[]
    for f,d in HEADS.items():
        im=cv2.imread(f'ref-scenes-{f}.png')
        for s,(cx,cy) in d.items():
            crop,lab,out=feats(im,cx,cy)
            v=cv2.resize(im[cy-R:cy+R,cx-R:cx+R],None,fx=3,fy=3,interpolation=cv2.INTER_NEAREST)
            for j,(x,y,w,h,a,i) in enumerate(out):
                cv2.rectangle(v,(3*x,3*y),(3*(x+w),3*(y+h)),(0,0,255),2); cv2.putText(v,str(j),(3*x,3*y-2),0,0.7,(255,0,0),2)
            cv2.putText(v,s,(5,20),0,0.6,(0,128,0),2); tiles.append(v)
            print(s,[o[:5] for o in out])
    rows=[np.hstack(tiles[i:i+5]) for i in range(0,15,5)]
    cv2.imwrite('/tmp/claude-0/faces.png',np.vstack(rows))
