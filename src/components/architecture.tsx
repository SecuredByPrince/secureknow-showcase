import { Icon } from './primitives';

const boundaries = [
    { title: 'Verify identity', icon: 'people', detail: 'Organisational sign-in and active workspace membership.', status: 'Live Entra verification pending' },
    { title: 'Authorise knowledge', icon: 'shield', detail: 'Current document permissions and published versions.', status: 'Locally tested foundation' },
    { title: 'Retrieve evidence', icon: 'research', detail: 'Recheck candidates before evidence enters AI context.', status: 'Live search / RAG pending' },
    { title: 'Apply policy', icon: 'policy', detail: 'Trusted services evaluate explicit rules outside the model.', status: 'Locally tested foundation' },
    { title: 'Require human authority', icon: 'people', detail: 'Confirmation and independent approval remain distinct.', status: 'Synthetic preview' },
    { title: 'Govern agent actions', icon: 'workflow', detail: 'Bounded tools and verified outcomes; no execution here.', status: 'Planned capability' },
] as const;

export function Architecture() {
    return <figure className="architecture-visual" aria-labelledby="architecture-caption">
        <figcaption id="architecture-caption"><strong>The proposed trust architecture</strong><span>Six explicit boundaries. The model is never the authority.</span></figcaption>
        <ol>{boundaries.map((boundary,index)=><li key={boundary.title}>
            <div className="architecture-node-heading"><span className="architecture-step">0{index+1}</span><Icon name={boundary.icon}/></div>
            <h3>{boundary.title}</h3><p>{boundary.detail}</p><span className="architecture-status">{boundary.status}</span>
        </li>)}</ol>
        <p className="architecture-rule">AI proposes → trusted services enforce → humans authorise sensitive actions.</p>
    </figure>;
}
