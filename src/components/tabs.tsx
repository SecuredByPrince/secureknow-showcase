'use client';
import { useRef, type KeyboardEvent } from 'react';

export function TabBar({items,active,onChange,label,prefix}:{items:readonly {id:string;label:string}[];active:string;onChange:(id:string)=>void;label:string;prefix:string}) {
    const tabs=useRef<(HTMLButtonElement|null)[]>([]);
    function move(event:KeyboardEvent,index:number) {
        let target=index;
        if(event.key==='ArrowRight')target=(index+1)%items.length;
        else if(event.key==='ArrowLeft')target=(index-1+items.length)%items.length;
        else if(event.key==='Home')target=0;
        else if(event.key==='End')target=items.length-1;
        else return;
        event.preventDefault();onChange(items[target].id);tabs.current[target]?.focus();
    }
    return <div role="tablist" aria-label={label} className="tabs">{items.map((item,index)=><button type="button" role="tab" key={item.id} id={`${prefix}-tab-${item.id}`} aria-controls={`${prefix}-panel-${item.id}`} aria-selected={active===item.id} tabIndex={active===item.id?0:-1} ref={element=>{tabs.current[index]=element;}} onClick={()=>onChange(item.id)} onKeyDown={event=>move(event,index)}>{item.label}</button>)}</div>;
}
