'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ErrorMessage from '../(components)/ErrorMessage';
import type { Product } from '../../database/products';
import type { ProductResponseBodyPost } from '../api/dashboard/route';
import styles from './DashboardForm.module.scss';

// Type definition
type Props = {
  products: Product[];
};

export default function DashboardForm(props: Props) {
  // Data from database - all product data
  const productsData = props.products;

  // console.log('dataProducts', productsData);

  // State management
  // Calculate initial state values
  // const initialUnits = productsData.map((item) => {
  //   const objValues = {
  //     id: item.id, {
  //       months: item.months,
  //     unitsPlanMonth: item.unitsPlanMonth,
  //     }

  //   };
  //   return objValues;
  // });

  //  console.log('initialUnits', initialUnits);

  // Set states

  const initialUnits = { 1: { 1: 100, 2: 120, 3: 110 } };

  const [id, setId] = useState(0);
  const [costsDev, setCostsDev] = useState(0);
  const [productName, setProductName] = useState('');
  const [productColor, setProductColor] = useState('');
  const [pricePurchase, setPricePurchase] = useState(0);
  const [priceRetail, setPriceRetail] = useState(0);
  const [unitsPlanMonth, setUnitsPlanMonth] = useState(initialUnits);
  const [months, setMonths] = useState(0);
  const [years, setYears] = useState(0);
  const [errorMessage, setErrorMessage] = useState(0);

  // Handle input-change
  function handleInputChange(productId: number, month: number, value: number) {
    setUnitsPlanMonth((prev) => {
      // 1. Changing the value of the product with that productId retrieved from input-field
      const productToUpdate = { ...prev[productId], [month]: value };

      // 2. Returning the object, that holds the previous state with all key:value pairs that remain unchanged and add/change the updated/added key:value pair (productToUpdate)
      return {
        ...prev,
        [productId]: productToUpdate,
      };
    });
  }

  // console.log('initUnits', initialUnits);
  // State - Experiments

  // rowData ? rowData.unitsPlanMonth : 0

  // Loading router function to trigger database update where needed
  const router = useRouter();

  // Loading resetter function of form component states to use upon POST or PUT - ONLY NON-PLANNABLE ATTRIBUTES ARE POSSIBLE !!
  function resetFormStates() {
    setProductName('');
    setProductColor('');
    setPricePurchase(0);
    setPriceRetail(0);
    setUnitsPlanMonth({}); // exclude
    setMonths(0);
    setYears(0);
  }

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

      <h1>Plannable Products</h1>

      <div className={styles.ProductCardWrapper}>
        {idsData.map((productId) => {
          const sortedData = productsData.filter(
            (item) => item.id === productId,
          );

          return (
            <div className={styles.ProductCard} key={`productId-${productId}`}>
              {sortedData.map((item) => (
                <div key={item.productName}>{item.productName}</div>
              ))}
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                }}
              >
                <table>
                  <thead>
                    <tr>
                      {monthsData.map((month) => {
                        return <th key={`month-${month}`}>{month}</th>;
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
                          <td key={`month-${month}`}>
                            <input
                              value={unitsPlanMonth[productId]?.[month] || 0}
                              onChange={(event) =>
                                handleInputChange(
                                  productId,
                                  month,
                                  parseFloat(event.currentTarget.value),
                                )
                              }
                            />
                            <input
                              value={rowData ? rowData.priceRetail : 0}
                              onChange={(event) =>
                                setPriceRetail(
                                  parseFloat(event.currentTarget.value),
                                )
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </form>
            </div>
          ); // Second return - product card - productId
        })}
      </div>
    </div>
  ); // First return - OVERALL report
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
