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
  const [costsDev, setCostsDev] = useState(0);
  const [productName, setProductName] = useState('');
  const [productColor, setProductColor] = useState('');
  const [pricePurchase, setPricePurchase] = useState(0);
  const [priceRetail, setPriceRetail] = useState(0);
  const [unitsPlanMonth, setUnitsPlanMonth] = useState(0);
  const [months, setMonths] = useState(0);
  const [years, setYears] = useState(0);
  const [errorMessage, setErrorMessage] = useState(0);

  // Loading router function to trigger database update where needed
  const router = useRouter();

  // Loading resetter function of form component states to use where needed
  function resetFormStates() {
    setProductName('');
    setProductColor('');
    setPricePurchase(0);
    setPriceRetail(0);
    setUnitsPlanMonth(0);
    setMonths(0);
    setYears(0);
  }

  // Data from database - all product data
  const productsData = props.products;

  console.log('dataProducts', productsData);

  // Create array of months
  const monthsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Get unique existing productIds - avoiding double Ids based on monthly entries
  const idsData = [
    ...new Set(
      productsData.map((item) => {
        return item.id;
      }),
    ),
  ];

  return (
    <div>
      <h2>Turnover Report</h2>

      {idsData.map((productId) => {
        const sortedData = productsData.filter((item) => item.id === productId);

        return (
          <div key={productId}>
            <div>{productId}</div>
            <table>
              <thead>
                <tr>
                  {monthsData.map((month) => {
                    return <th key={month}>{month}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {monthsData.map((month) => {
                    const rowData = sortedData.find(
                      (item) => item.months === month,
                    );

                    return (
                      <td key={month}>
                        <input value={rowData ? rowData.unitsPlanMonth : 0} />
                      </td>
                    ); // Ensure no "undefined" is rendered if no data found for that month
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        ); // Second return - product card - productId
      })}
    </div>
  ); // First return - OVERALL turnover report
}
// Current code
/*
  {

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
                <div
                  key={`product-${product.id}`}
                  className={styles.PlannableElements}
                >
                  <div>{product.productName}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.Views}>
          <div>Views</div>
          <div>
            <Link href="/dashboard">Matrix</Link>
            <Link href="/charts">Charts</Link>
          </div>
        </div>
      </div>

      <div className={styles.ProductListWrapper}>

 {props.products.map((product) => {
          return (
            <div key={`product-${product.id}`}>
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
                unitsPlanMonth,
                months,
                years,
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
            <label>
              Units
              <input
                value={unitsPlanMonth}
                onChange={(event) =>
                  setUnitsPlanMonth(parseFloat(event.currentTarget.value))
                }
              />
            </label>
            <label>
              Months
              <input
                value={months}
                onChange={(event) =>
                  setMonths(parseFloat(event.currentTarget.value))
                }
              />
            </label>

            <label>
              Years
              <input
                value={years}
                onChange={(event) =>
                  setYears(parseFloat(event.currentTarget.value))
                }
              />
            </label>

            <button>Create new product</button>
          </div>
        </form>

        {/*   <ErrorMessage>{errorMessage}</ErrorMessage>
      </div>
    </div>
  );


  }

   */
