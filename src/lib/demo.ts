export const DEMOS = [
    {id:'assistant',label:'AI Assistant',title:'An answer you can trace'},
    {id:'governance',label:'Governance',title:'A published source, not just an upload'},
    {id:'policy',label:'Policy Decisions',title:'Rules decide. AI does not.'},
    {id:'research',label:'Research Agent',title:'Compare evidence. Surface the gaps.'},
    {id:'monitoring',label:'Monitoring Agent',title:'Keep review dates visible'},
    {id:'workflow',label:'IT Workflow',title:'From a useful answer to a controlled request'},
    {id:'passport',label:'Trust Passport',title:'The story behind a decision'},
] as const;
export type DemoId = typeof DEMOS[number]['id'];
export const journey = [
    {name:'Know',text:'Start with published information the employee is authorised to read.',visual:'VPN Support Guide · published v2 · sample evidence'},
    {name:'Verify',text:'Recheck evidence eligibility and evaluate an action-specific backend rule.',visual:'Identity + workspace + resource + policy version'},
    {name:'Approve',text:'Ask for employee confirmation. Require independent approval for sensitive changes.',visual:'Ordinary ticket: confirmation · Sensitive change: approval'},
    {name:'Act',text:'A future trusted executor will revalidate scope and confirm the actual result.',visual:'Execution unavailable in this public preview'},
    {name:'Prove',text:'A planned Trust Passport will connect the evidence and confirmed outcome.',visual:'Sample references · No real transaction or receipt'},
] as const;
export type Outcome = 'ALLOW'|'DENY'|'APPROVAL_REQUIRED';
export function exampleDecision(scenario:'ordinary'|'sensitive'|'outside'): {outcome:Outcome;reason:string;obligations:string[]} {
    if(scenario==='outside')return {outcome:'DENY',reason:'The example requester is outside the permitted resource scope.',obligations:['No action may proceed']};
    if(scenario==='sensitive')return {outcome:'APPROVAL_REQUIRED',reason:'The example request involves a privileged system change.',obligations:['Independent authorised approver','Current permission recheck','Execution unavailable']};
    return {outcome:'ALLOW',reason:'The example rule permits an ordinary self-service IT ticket.',obligations:['Employee confirmation','Current permission recheck','Execution unavailable']};
}
export const WORKFLOW_STEPS = ['Guidance','Draft','Review','Policy check','Next steps'] as const;
export function validDraft(summary:string,details:string) {return summary.trim().length>=1 && summary.length<=160 && details.trim().length>=1 && details.length<=1000;}
