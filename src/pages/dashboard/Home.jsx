import { withProtected } from '../../components/Authentication';

function DashboardHome() {
  return <div>owo</div>;
}

export default withProtected(DashboardHome, 'NOPE');
