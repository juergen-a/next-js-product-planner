'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ErrorMessage from '../(components)/ErrorMessage';
import type { Product } from '../../database/products';
import { up } from '../../migrations/00000-createTableProducts';
import type {
  ProductResponseBodyDelete,
  ProductResponseBodyPut,
} from '../api/dashboard/[productId]/route';
import type { ProductResponseBodyPost } from '../api/dashboard/route';
import styles from './DashboardForm.module.scss';

// Type definition
type Props = {
  products: Product[];
};

export default function DashboardForm(props: Props) {
  // Data from database - all product data

  const productsData = props.products;

  const processProductData = (productsData) => {
    const initialUnits = {};
    const initialPriceRetail = {};

    // Step 1: Process the productsData and populate initialUnits and initialPriceRetail
    productsData.forEach((product) => {
      const { id, months, unitsPlanMonth, priceRetail } = product;

      // Initialize if not already present for the product id
      if (!initialUnits[id]) {
        initialUnits[id] = {};
        initialPriceRetail[id] = {};
      }

      // Populate the data
      initialUnits[id][months] = unitsPlanMonth;
      initialPriceRetail[id][months] = priceRetail;
    });

    // Step 2: Calculate the initialTotals based on initialUnits
    const initialTotals = {};

    Object.keys(initialUnits).forEach((outerKey) => {
      const innerValues = Object.values(initialUnits[outerKey]);

      // Calculate the sum of the units for each product id
      const sum = innerValues.reduce((total, value) => total + value, 0);

      initialTotals[outerKey] = { value: sum };
    });

    // You can now return or use the initialTotals object as needed
    return { initialUnits, initialPriceRetail, initialTotals };
  };

  // State initialization with processed data
  const { initialUnits, initialPriceRetail, initialTotals } =
    processProductData(productsData);

  // const productsData = data.map((product) => ({
  //   ...product,
  //   pricePurchase: parseFloat(product.pricePurchase),
  //   priceRetail: parseFloat(product.priceRetail),
  //   yearlyTotals: parseFloat(product.yearlyTotals),
  // }));

  // console.log('productsData', productsData);

  // // State management
  // // PLANNABLES
  // // Setting plannable variables for initial state values
  // const initialUnits = {};
  // const initialPriceRetail = {};
  // const initialPricePurchase = {};
  // const initialCostsDev = {};
  // const initialCostsAdmin = {};

  // // Creating the datastructure and assigning retrieved initial values from DB
  // for (const product of productsData) {
  //   const { id, months, unitsPlanMonth, priceRetail } = product;

  //   initialUnits[id] = {} || {};
  //   initialPriceRetail[id] = {} || {};
  //   // initialPricePurchase[id] = {} || {};
  //   // initialCostsDev[id] = {} || {};
  //   // initialCostsAdmin[id] = {} || {};

  //   initialUnits[id][months] = unitsPlanMonth;
  //   initialPriceRetail[id][months] = priceRetail;
  //   // initialPricePurchase[id][months] = pricePurchase;
  //   // initialCostsDev[id][months] = costsDev;
  //   // initialCostsAdmin[id][months] = costsAdmin;
  // }

  // console.log('initialUnits-1', initialUnits);
  // console.log('initialPriceRetail', initialPriceRetail);

  // Yearly totals - initial state values

  // const initialTotals = {};

  // Object.keys(initialUnits).forEach((outerKey) => {
  //   const innerValues = Object.values(initialUnits[outerKey]);

  //   const sum = innerValues.reduce((total, value) => total + value, 0);

  //   initialTotals[outerKey] = { value: sum };
  // });

  // Set states
  const [productName, setProductName] = useState('');
  const [productColor, setProductColor] = useState('');
  const [priceRetailPost, setPriceRetailPost] = useState(0);
  const [pricePurchasePost, setPricePurchasePost] = useState(0);
  const [products, setProducts] = useState<Product[]>(props.products);
  const [unitsPlanMonth, setUnitsPlanMonth] = useState(initialUnits);
  const [yearlyTotals, setYearlyTotals] = useState(initialTotals);
  const [priceRetail, setPriceRetail] = useState(initialPriceRetail);
  const [pricePurchase, setPricePurchase] = useState(0);
  const [costsDev, setCostsDev] = useState(0);
  const [errorMessage, setErrorMessage] = useState(0);
  // const [months, setMonths] = useState(0);
  // const [years, setYears] = useState(0);
  // const [id, setId] = useState(0);

  useEffect(() => {
    console.log('Products updated', products);
  }, [products]); // This will log whenever products change.

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
        [productId]: { value: value || 0 },
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

  const idsSorted = idsData.sort();

  console.log('idsData', idsData);

  const transformedData = [];

  productsData.forEach((product) => {
    // Check if the id is already in the transformedData array
    if (!transformedData.some((item) => item.id === product.id)) {
      // Add the product to the transformedData array with only the required fields
      transformedData.push({
        id: product.id,
        productName: product.productName,
        productColor: product.productColor,
        years: product.years,
      });
    }
  });

  console.log(transformedData);

  const transformedSorted = transformedData.sort((a, b) => a.id - b.id);

  console.log(transformedSorted);

  return (
    <div className={styles.DashboardForm}>
      <div className={styles.Description}>
        <div>Logged-in as user: User-A</div>
      </div>

      <div className={styles.WrapperRight}>
        <div className={styles.PlannableProducts}>
          <div>Plannable Products</div>
          <div>
            {transformedSorted.map((product) => {
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
        {idsSorted.map((productId) => {
          const sortedData = transformedSorted.filter(
            (item) => item.id === productId,
          );

          return (
            <div className={styles.ProductCard} key={`productId-${productId}`}>
              {sortedData.map((item) => (
                <div key={item.id}>
                  <div> {item.productName}</div>
                  <div>{item.productColor}</div>
                  <div>{item.years}</div>
                </div>
              ))}
              <form
                onSubmit={async (event) => {
                  event.preventDefault();

                  const dataToUpdate = {
                    priceRetail: priceRetail[productId],
                    unitsPlanMonth: unitsPlanMonth[productId],
                    yearlyTotals: yearlyTotals[productId],
                  };

                  console.log('Before sending data:', {
                    priceRetail: priceRetail[productId],
                    unitsPlanMonth: unitsPlanMonth[productId],
                    yearlyTotals: yearlyTotals[productId],
                  });

                  const response = await fetch(`/api/dashboard/${productId}`, {
                    method: 'PUT',
                    body: JSON.stringify(dataToUpdate),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });

                  console.log('After sending data:', {
                    priceRetail: priceRetail[productId],
                    unitsPlanMonth: unitsPlanMonth[productId],
                    yearlyTotals: yearlyTotals[productId],
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
                          value={yearlyTotals[productId]?.value || 0} // this value gets transferred to handleTotalsChange
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
                <button>Update</button>
              </form>
              <button
                onClick={async () => {
                  const response = await fetch(`api/dashboard/${productId}`, {
                    method: 'DELETE',
                  });

                  setErrorMessage('');

                  if (!response.ok) {
                    let newErrorMessage = 'Error creating animal';

                    const responseBody: ProductResponseBodyDelete =
                      await response.json();

                    if ('error' in responseBody) {
                      newErrorMessage = responseBody.error;
                      return newErrorMessage;
                    }

                    setErrorMessage(newErrorMessage);
                    return;
                  }
                  router.refresh();
                  resetFormStates();
                }}
              >
                Delete
              </button>
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

            const body: ProductResponseBodyPost = await response.json();

            if (!response.ok) {
              let newErrorMessage = 'Error creating animal';

              if ('error' in body) {
                newErrorMessage = body.error;
                return newErrorMessage;
              }

              return;
            }
            // Update products in the state with the new product
            const newProduct = body;
            setProducts((prevProducts) => [
              ...prevProducts,
              newProduct, // Assuming the response contains the newly created product data
            ]);

            router.push('/dashboard');
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
