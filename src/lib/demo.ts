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
export function parsePreview(value:string|null):DemoId {return DEMOS.find(item=>item.id===value)?.id??'assistant';}
export function previewLink(id:DemoId) {return `/demo/?preview=${id}#product-preview`;}
export const sampleQuestions = [
    {id:'vpn',question:'What should I try before reporting a VPN issue?',answer:'Restart the approved VPN client and note the error code. If the issue continues, prepare an IT support request. Never share passwords or recovery codes.',source:'VPN Support Guide',version:'Published v2 / section 3',evidence:'Restart the approved VPN client. Record the error code for the service desk.',eligible:true},
    {id:'equipment',question:'How do I request specialist equipment?',answer:'The sample policy requires a reviewed specialist-equipment request. A manager approval boundary applies before procurement; no purchase or approval is performed here.',source:'Equipment Policy',version:'Published v3 / section 2',evidence:'Specialist equipment requires a documented request and independent manager approval.',eligible:true},
    {id:'unavailable',question:'Can I see the confidential payroll file?',answer:'No eligible sample evidence is available. This example abstains instead of inventing an answer or exposing a restricted source.',source:null,version:null,evidence:null,eligible:false},
] as const;
export function sampleAnswer(id:string) {return sampleQuestions.find(item=>item.id===id)??sampleQuestions[2];}
export const researchDocuments = [
    {id:'equipment',title:'Equipment Policy / v3',text:'Standard laptops are supplied. Specialist devices require manager approval.'},
    {id:'onboarding',title:'Onboarding Guide / v2',text:'New starters receive a standard laptop. Procurement lead times are not specified.'},
    {id:'remote',title:'Remote Work Guide / v2',text:'Use approved devices remotely. Specialist requests follow the equipment policy.'},
] as const;
export function compareSamples(first:string,second:string) {
    const a=researchDocuments.find(item=>item.id===first),b=researchDocuments.find(item=>item.id===second);
    if(!a||!b||a===b)return null;
    return {sources:[a,b],finding:'The samples distinguish approved standard equipment from specialist requests.',gap:'Neither selected sample establishes a complete procurement lead time or confirmed approval outcome.'};
}
export const reviewDocuments = [
    {title:'Access Review Guide / v1',days:-4,owner:'Security Operations'},
    {title:'VPN Support Guide / v2',days:1,owner:'IT Operations'},
    {title:'Equipment Policy / v3',days:15,owner:'Workplace Services'},
] as const;
export function reviewSamples(windowDays:number) {return reviewDocuments.filter(item=>item.days<=windowDays);}
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
