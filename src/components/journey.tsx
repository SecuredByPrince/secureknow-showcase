'use client';
import { useId, useState } from 'react';
import { journey } from '../lib/demo.ts';
import { TabBar } from './tabs';
import { Icon } from './primitives';
export function Journey() {
    const [active,setActive]=useState('Know');const prefix=useId();
    const items=journey.map(item=>({id:item.name,label:item.name}));
    return <div className="journey"><TabBar items={items} active={active} onChange={setActive} label="Know to Prove journey" prefix={prefix}/>{journey.map((step,index)=><div key={step.name} role="tabpanel" hidden={active!==step.name} id={`${prefix}-panel-${step.name}`} aria-labelledby={`${prefix}-tab-${step.name}`} tabIndex={0} className="journey-detail"><span className="journey-number">0{index+1}</span><div><h3>{step.name}</h3><p>{step.text}</p></div><div className="journey-visual"><Icon name={['knowledge','policy','people','workflow','passport'][index]}/><span>{step.visual}</span></div></div>)}</div>;
}
