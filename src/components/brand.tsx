import Link from 'next/link';
export function Mark({size=29}:{size?:number}){
 return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M3 25V9a5 5 0 0 1 10 0v14M13 23V9a5 5 0 0 1 10 0v16M23 25V13h6v12" stroke="currentColor" strokeWidth="3.8" strokeLinejoin="round"/><path d="M3 29h26" stroke="currentColor" strokeWidth="2"/></svg>;
}
export function Brand({dark=false}:{dark?:boolean}){return <Link href="/" className={`brand ${dark?'brand-dark':''}`} aria-label="Money Station home"><Mark/><span>money<span className="brand-station">station</span><span className="brand-dot">.</span></span></Link>;}
export function NearMark(){return <svg className="near-mark" viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><path d="M3 16V4c0-.8 1-.9 1.5-.2L16 16V4M5 4l10 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
