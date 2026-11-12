import { ArrowUpRight, Check, Fingerprint, LockKeyhole, ShieldCheck } from 'lucide-react';
export function Network({ compact = false, selected = 'b', progress = false }: { compact?: boolean; selected?: string; progress?: boolean }) {
  return <div className={`network ${compact ? 'network-compact' : ''} ${progress ? 'network-running' : ''}`}>
    <div className="network-top"><span><span className="dot"/> Shared anonymity set</span><span className="mini-tag">NEAR</span></div>
    <div className="network-flow">
      <div className="flow-end"><div className="flow-icon"><Fingerprint size={23}/></div><strong>Your private note</strong><small>Origin stays hidden</small></div>
      <div className="flow-route"><svg className="route-lines" viewBox="0 0 420 180" preserveAspectRatio="none" aria-hidden="true"><path d="M0 90 C80 90 70 22 170 22H250C330 22 330 90 420 90M0 90H420M0 90C80 90 70 158 170 158H250C330 158 330 90 420 90"/><path className="route-active" d={selected === 'a' ? 'M0 90 C80 90 70 22 170 22H250C330 22 330 90 420 90' : selected === 'c' ? 'M0 90C80 90 70 158 170 158H250C330 158 330 90 420 90' : 'M0 90H420'}/></svg>
        {['a', 'b', 'c'].map(id => <div key={id} className={`flow-vault flow-vault-${id} ${selected === id ? 'is-selected' : ''}`}><div className="vault-glyph"><LockKeyhole size={17}/></div><span>Vault {id.toUpperCase()}</span>{selected === id && <Check size={12}/>}</div>)}
      </div>
      <div className="flow-end"><div className="flow-icon recipient-icon"><ArrowUpRight size={23}/></div><strong>Fresh recipient</strong><small>Full principal received</small></div>
    </div>
    <div className="network-bottom"><ShieldCheck size={14}/><span>Shared proof. Distributed funds.</span><span className="network-caption">Illustrative flow</span></div>
  </div>;
}
