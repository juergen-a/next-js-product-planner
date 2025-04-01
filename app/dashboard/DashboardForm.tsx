'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ErrorMessage from '../(components)/ErrorMessage';
import type { Product } from '../../database/products';
import { up } from '../../migrations/00000-createTableProducts';
import type { ProductResponseBodyPut } from '../api/dashboard/[productId]/route';
import type { ProductResponseBodyPost } from '../api/dashboard/route';
import styles from './DashboardForm.module.scss';

// Type definition
type Props = {
  products: Product[];
};

export default function DashboardForm(props: Props) {
  // Data from database - all product data
  const productsData = props.products;
  console.log('productsData', productsData);

  // State management

  // PLANNABLES
  // Setting plannable variables for initial state values
  const initialUnits = {};
  const initialPriceRetail = {};
  const initialPricePurchase = {};
  const initialCostsDev = {};
  const initialCostsAdmin = {};

  // Creating the datastructure and assigning retrieved initial values from DB
  for (const product of productsData) {
    const { id, months, unitsPlanMonth, priceRetail } = product;

    initialUnits[id] = {} || {};
    initialPriceRetail[id] = {} || {};
    // initialPricePurchase[id] = {} || {};
    // initialCostsDev[id] = {} || {};
    // initialCostsAdmin[id] = {} || {};

    initialUnits[id][months] = unitsPlanMonth;
    initialPriceRetail[id][months] = priceRetail;
    // initialPricePurchase[id][months] = pricePurchase;
    // initialCostsDev[id][months] = costsDev;
    // initialCostsAdmin[id][months] = costsAdmin;
  }

  console.log('initialUnits-1', initialUnits);

  // Yearly totals - initial state values
  const initialTotals = {};

  Object.keys(initialUnits).forEach((outerKey) => {
    const innerValues = Object.values(initialUnits[outerKey]);

    const sum = innerValues.reduce((total, value) => total + value, 0);

    initialTotals[outerKey] = sum;
  });

  // Set states
  const [productName, setProductName] = useState('');
  const [productColor, setProductColor] = useState('');
  const [priceRetailPost, setPriceRetailPost] = useState(0);
  const [pricePurchasePost, setPricePurchasePost] = useState(0);
  const [unitsPlanMonth, setUnitsPlanMonth] = useState(initialUnits);
  const [yearlyTotals, setYearlyTotals] = useState(initialTotals);
  const [priceRetail, setPriceRetail] = useState(initialPriceRetail);
  const [pricePurchase, setPricePurchase] = useState(0);
  const [costsDev, setCostsDev] = useState(0);
  const [errorMessage, setErrorMessage] = useState(0);
  // const [months, setMonths] = useState(0);
  // const [years, setYears] = useState(0);
  // const [id, setId] = useState(0);

  // Handle input-change - ONLY PLANNABLE ATTRIBUTES ARE POSSIBLE HERE!
  // Handle input 'unitsPlanMonth', TBD

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
  function handlePriceRetail(productId: number, month: number, value: number) {
    setPriceRetail((prev) => {
      // 1. Changing the value of the product with that productId retrieved from input-field
      const productToUpdate = { ...prev[productId], [month]: value };

      // 2. Returning the object, that holds the previous state with all key:value pairs that remain unchanged and add/change the updated/added key:value pair (productToUpdate)
      return {
        ...prev,
        [productId]: productToUpdate,
      };
    });
  }

  // Handle yearly totals change - upon input change on unitsPlanMonth
  useEffect(() => {
    const updatedUnitsPlanMonth = {};

    Object.keys(unitsPlanMonth).forEach((outerKey) => {
      const innerValues = Object.values(unitsPlanMonth[outerKey]);

      const sum = innerValues.reduce((total, value) => total + value, 0);

      updatedUnitsPlanMonth[outerKey] = sum;
    });

    Object.keys(updatedUnitsPlanMonth).forEach((productId) => {
      handleTotalsChange(productId, updatedUnitsPlanMonth[productId]);
    });
  }, [unitsPlanMonth]);

  function handleTotalsChange(productId: number, value: number) {
    setYearlyTotals((prev) => {
      // Add the changed 'updatedUnitsPlanMonth' value only to the previous state array - no object as for handleInputChange, different data structure
      return {
        ...prev,
        [productId]: { value },
      };
    });
  }

  // Loading router function to trigger database update where needed
  const router = useRouter();

  // Loading resetter function of form component states to use upon POST or PUT - ONLY NON-PLANNABLE ATTRIBUTES ARE POSSIBLE HERE!
  function resetFormStates() {
    setProductName('');
    setProductColor('');
    setPricePurchasePost(0);
    setPriceRetailPost(0);
  }

  // Values to compare keys with
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

                  const response = await fetch(`/api/dashboard/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                      priceRetail,
                      unitsPlanMonth,
                      yearlyTotals,
                    }),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });

                  if (!response.ok) {
                    let newErrorMessage = 'Error creating animal';

                    const body: ProductResponseBodyPut = await response.json();

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
                <table>
                  <thead>
                    <tr>
                      <th>Months</th>
                      {monthsData.map((month) => {
                        return <th key={`month-${month}`}>{month}</th>;
                      })}
                      <th>Totals</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Units</th>
                      {monthsData.map((month) => {
                        {
                          /*         const rowData = sortedData.find(
                          (item) => item.months === month,
                        );
*/
                        }
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
                          </td>
                        );
                      })}
                      <td key={`productId-${productId}`}>
                        <input
                          value={yearlyTotals[productId].value || 0} // this value gets transferred to handleTotalsChange
                          onChange={(event) =>
                            handleTotalsChange(
                              productId,
                              parseFloat(event.currentTarget.value),
                            )
                          }
                        />
                      </td>
                    </tr>

                    <tr>
                      <th>Retail price</th>
                      {monthsData.map((month) => {
                        const rowData = sortedData.find(
                          (item) => item.months === month,
                        );
                        return (
                          <td key={`month-${month}`}>
                            <input
                              value={priceRetail[productId]?.[month] || 0}
                              onChange={(event) =>
                                handlePriceRetail(
                                  productId,
                                  month,
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
                <button
                  onClick={async () => {
                    // const product = [productId];
                    const response = await fetch(
                      `/api/dashboard/${productId}`,
                      {
                        method: 'PUT',
                        body: JSON.stringify({
                          priceRetail: priceRetail[productId],
                          unitsPlanMonth: unitsPlanMonth[productId],
                          yearlyTotals: yearlyTotals[productId],
                        }),
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      },
                    );

                    if (!response.ok) {
                      let newErrorMessage = 'Error creating animal';

                      const body: ProductResponseBodyPut =
                        await response.json();

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
                  Update
                </button>
                <button>Delete</button>
              </form>
            </div>
          ); // Second return - product card - productId
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
                pricePurchasePost,
                priceRetailPost,
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
                value={pricePurchasePost}
                onChange={(event) =>
                  setPricePurchasePost(parseFloat(event.currentTarget.value))
                }
              />
            </label>
            <label>
              Retail price
              <input
                value={priceRetailPost}
                onChange={(event) =>
                  setPriceRetailPost(parseFloat(event.currentTarget.value))
                }
              />
            </label>

            <button>Create new product</button>
          </div>
        </form>

        <ErrorMessage>{errorMessage}</ErrorMessage>
      </div>
    </div> // DashboardForm - First return - OVERALL report
  );
}
