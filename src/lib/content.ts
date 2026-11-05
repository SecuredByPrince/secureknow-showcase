export const CONTACT = 'securedbyprince@gmail.com';
export const REFERENCE = 'https://github.com/SecuredByPrince/secureknow-reference-architecture';
export const subjects = {
    partner: 'SecureKnow Partnership Enquiry', sponsor: 'SecureKnow Sponsorship Enquiry',
    demo: 'SecureKnow Demo Request', pilot: 'SecureKnow Pilot Interest', support: 'SecureKnow Support Enquiry',
    general: 'SecureKnow General Enquiry',
    collaborate: 'SecureKnow Collaboration Enquiry', investment: 'SecureKnow Investment Enquiry',
} as const;
export const messages = {
    partner: "Hello SecureKnow Team,\n\nI'm interested in exploring a partnership with SecureKnow.\n\nMy name:\nOrganisation:\nPartnership interest:\nAdditional details:\n\nI look forward to hearing from you.",
    sponsor: "Hello SecureKnow Team,\n\nI'm interested in learning more about sponsorship opportunities for SecureKnow.\n\nMy name:\nOrganisation:\nArea of sponsorship:\nAdditional details:\n\nThank you.",
    demo: "Hello SecureKnow Team,\n\nI'd like to request a demonstration of SecureKnow.\n\nMy name:\nOrganisation:\nPreferred meeting date:\nWhat I'd like to explore:\n\nThank you.",
} as const;
export function emailLink(kind: keyof typeof subjects) {
    const body = kind in messages ? messages[kind as keyof typeof messages] : undefined;
    return `mailto:${CONTACT}?subject=${encodeURIComponent(subjects[kind])}${body ? `&body=${encodeURIComponent(body)}` : ''}`;
}
export const capabilities = [
    {icon:'knowledge',name:'Enterprise knowledge',status:'Locally validated',text:'Permission-aware answers grounded in published, version-specific evidence.'},
    {icon:'document',name:'Document governance',status:'Locally validated',text:'Ownership, controlled publication and protected version history.'},
    {icon:'policy',name:'Deterministic policy',status:'Locally validated',text:'Typed decisions with explicit reasons and obligations. AI never grants authority.'},
    {icon:'research',name:'Specialised AI agents',status:'Product preview',text:'Bounded research, workflow preparation and knowledge monitoring.'},
    {icon:'passport',name:'Trust Passports',status:'Planned',text:'A traceable record connecting evidence, decisions, approvals and confirmed outcomes.'},
] as const;
export const roadmap = [
    {title:'Completed locally',state:'local',items:['Product foundation and frontend refinement','Organisation binding and document governance','Published-evidence retrieval and deterministic policy foundations']},
    {title:'Current priorities',state:'current',items:['Real Microsoft Entra sign-in verification','Live AI and permission-aware RAG integration','Microsoft Foundry and Azure AI Search verification']},
    {title:'Upcoming',state:'future',items:['Knowledge Research, Workflow Automation and Knowledge Monitoring Agents','Durable workflows and native IT support ticket execution','Trust Passports, Microsoft 365 integrations, enterprise pilot and SaaS readiness']},
] as const;
export const partnerCategories = [
    {icon:'cloud',title:'Cloud & Azure sponsorship',text:'Support isolated development, pilot infrastructure and operational learning.',kind:'sponsor'},
    {icon:'research',title:'AI models & compute',text:'Help evaluate grounded answers and bounded agents with realistic workloads.',kind:'sponsor'},
    {icon:'people',title:'Technical mentorship',text:'Guide engineering decisions, model evaluation and a measured pilot programme.',kind:'partner'},
    {icon:'shield',title:'Architecture & security review',text:'Challenge trust boundaries, evaluation methods and release assurance.',kind:'partner'},
    {icon:'people',title:'Enterprise pilot partnerships',text:'Shape a focused pilot around approved knowledge and internal IT requests.',kind:'pilot'},
    {icon:'code',title:'Product development collaboration',text:'Contribute expertise in accessible UX, retrieval, testing and reliable systems.',kind:'collaborate'},
    {icon:'growth',title:'Funding & strategic sponsorship',text:'Explore support for a measured path from engineering foundations to pilot readiness.',kind:'investment'},
] as const;
