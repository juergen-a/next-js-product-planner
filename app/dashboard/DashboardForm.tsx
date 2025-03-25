'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from '../(components)/ErrorMessage';
import type { Product } from '../../database/products';
import type { ProductResponseBodyPost } from '../api/dashboard/route';
import styles from './DashboardForm.module.scss';

// Type definition
type Props = {
  products: Product[];
};

export default function DashboardForm(props: Props) {
  // State management
  const [id, setId] = useState(0);
  const [unitMonth, setUnitMonth] = useState(0);
  const [costsDev, setCostsDev] = useState(0);
  const [productName, setProductName] = useState('');
  const [productColor, setProductColor] = useState('');
  const [pricePurchase, setPricePurchase] = useState(0);
  const [priceRetail, setPriceRetail] = useState(0);
  const [errorMessage, setErrorMessage] = useState(0);

  // Trigger database update
  const router = useRouter();

  // Resetting form
  function resetFormStates() {
    setProductName('');
    setProductColor('');
    setPricePurchase(0);
    setPriceRetail(0);
  }

  return (
    <div className={styles.DashboardForm}>
      <div className={styles.Description}>
        <div>Logged-in as user: User-A</div>
      </div>

      <div className={styles.WrapperRight}>
        <div className={styles.PlannableProducts}>
          <div>Plannable Products</div>
          <div>
            {props.products.map((product) => {
              return (
                <div key={`product-${product.id}`}>
                  <div>{product.productName}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.Views}>
          <div>Views</div>
          <div>
            <div>Matrix</div>
            <div>Charts</div>
          </div>
        </div>
      </div>

      <div className={styles.ProductList}>
        {props.products.map((product) => {
          return (
            <div key={`product-${product.id}`} className={styles.ProductItem}>
              <div>Product name: {product.productName}</div>
              <div>Product color: {product.productColor}</div>
              <form>
                <label>
                  Retail price
                  <input
                    value={product.priceRetail}
                    onChange={(event) =>
                      setPriceRetail(parseFloat(event.currentTarget.value))
                    }
                  />
                </label>
                <button>Update</button>
                <button>Delete</button>
              </form>
            </div>
          );
        })}
      </div>

      <div className={styles.CreateProduct}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();

            const response = await fetch('/api/dashboard', {
              method: 'POST',
              body: JSON.stringify({
                productName,
                productColor,
                pricePurchase,
                priceRetail,
              }),
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              let newErrorMessage = 'Error creating animal';

              const body: ProductResponseBodyPost = await response.json();

              if ('error' in body) {
                newErrorMessage = body.error;
                return newErrorMessage;
              }

              return;
            }

            router.refresh();
            resetFormStates();
          }}
        >
          <div className={styles.CreateWrapper}>
            <label>
              Product name
              <input
                value={productName}
                onChange={(event) => setProductName(event.currentTarget.value)}
              />
            </label>
            <label>
              Product color
              <input
                value={productColor}
                onChange={(event) => setProductColor(event.currentTarget.value)}
              />
            </label>
            <label>
              Purchase price
              <input
                value={pricePurchase}
                onChange={(event) =>
                  setPricePurchase(parseFloat(event.currentTarget.value))
                }
              />
            </label>
            <label>
              Retail price
              <input
                value={priceRetail}
                onChange={(event) =>
                  setPriceRetail(parseFloat(event.currentTarget.value))
                }
              />
            </label>

            <button>Create new product</button>
          </div>
        </form>

        {/*   <ErrorMessage>{errorMessage}</ErrorMessage>  */}
      </div>
    </div>
  );
}
