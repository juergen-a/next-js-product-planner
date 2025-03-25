import Footer from '../(components)/Footer';
import Header from '../(components)/Header';
import { getProductsInsecure } from '../../database/products';
import DashboardForm from './DashboardForm';

// Read database values for products of users currently logged in

export default async function DashboardPage() {
  const products = await getProductsInsecure();
  return (
    <>
      <Header />
      <DashboardForm products={products} />
      <Footer />
    </>
  );
}
