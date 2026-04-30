import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';

function Reservations() {
  usePageTitle('Reservations');
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <i className="fa-solid fa-lock text-4xl mb-3" />
        <p className="text-lg font-medium">Reservations removed</p>
        <p className="text-sm mt-1">Stock reservation has been replaced by supply fulfilment.</p>
      </div>
    </Layout>
  );
}

export default Reservations;
