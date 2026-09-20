import { useMemo } from "react";
import {
  FaBoxOpen,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from "react-icons/fa";
import "./TopProducts.css";

function TopProducts({
  products = [],
  loading = false,
  limit = 5,
  title = "Top Products",
  subtitle = "Best performing products"
}) {
  const normalizedProducts = useMemo(() => {
    if (!Array.isArray(products)) {
      return [];
    }

    return products
      .map((product, index) => {
        const sales =
          Number(
            product?.sales ??
            product?.totalSales ??
            product?.quantitySold ??
            product?.unitsSold ??
            product?.sold ??
            0
          ) || 0;

        const revenue =
          Number(
            product?.revenue ??
            product?.totalRevenue ??
            product?.salesAmount ??
            product?.amount ??
            0
          ) || 0;

        const growth =
          Number(
            product?.growth ??
            product?.growthPercentage ??
            product?.change ??
            0
          ) || 0;

        const stock =
          Number(
            product?.stock ??
            product?.quantity ??
            product?.inventory ??
            0
          ) || 0;

        return {
          id:
            product?._id ??
            product?.id ??
           `${product?.name || "product"}-${index}`,

          name:
            product?.name ??
            product?.productName ??
            "Unnamed Product",

          category:
            product?.category?.name ??
            product?.category ??
            "General",

          sales,
          revenue,
          growth,
          stock,

          image:
            product?.image ??
            product?.imageUrl ??
            product?.thumbnail ??
            ""
        };
      })
      .sort((a, b) => {
        if (b.revenue !== a.revenue) {
          return b.revenue - a.revenue;
        }

        return b.sales - a.sales;
      })
      .slice(0, limit);
  }, [products, limit]);

  const formatNumber = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return number.toLocaleString();
  };

  const formatMoney = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0.00";
    }

    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) {
      return <FaArrowUp />;
    }

    if (growth < 0) {
      return <FaArrowDown />;
    }

    return <FaMinus />;
  };

  const getGrowthClass = (growth) => {
    if (growth > 0) {
      return "positive";
    }

    if (growth < 0) {
      return "negative";
    }

    return "neutral";
  };

  if (loading) {
    return (
      <section className="top-products">

        <div className="top-products-header">

          <div>
            <span className="top-products-label">
              PERFORMANCE
            </span>

            <h2>
              {title}
            </h2>

            <p>
              {subtitle}
            </p>
          </div>

        </div>

        <div className="top-products-loading">

          {[1, 2, 3, 4, 5].map((item) => (
            <div
              className="top-products-skeleton"
              key={item}
            >
              <div className="top-products-skeleton-image" />

              <div className="top-products-skeleton-content">
                <div />
                <div />
              </div>

              <div className="top-products-skeleton-value" />
            </div>
          ))}

        </div>

      </section>
    );
  }

  return (
    <section className="top-products">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="top-products-header">

        <div>

          <span className="top-products-label">
            PERFORMANCE
          </span>

          <h2>
            {title}
          </h2>

          <p>
            {subtitle}
          </p>

        </div>

        <div className="top-products-count">

          <FaBoxOpen />

          <span>
            {normalizedProducts.length}
          </span>

        </div>

      </div>


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {normalizedProducts.length === 0 ? (

        <div className="top-products-empty">

          <div className="top-products-empty-icon">
            <FaBoxOpen />
          </div>

          <h3>
            No product data yet
          </h3>

          <p>
            Product performance will appear here
            once your business starts recording sales.
          </p>

        </div>

      ) : (

        <div className="top-products-list">

          {normalizedProducts.map((product, index) => (

            <div
              className="top-product-item"
              key={product.id}
            >

              {/* =================================================
                  RANK
              ================================================= */}

              <div className="top-product-rank">
                #{index + 1}
              </div>


              {/* =================================================
                  PRODUCT
              ================================================= */}

              <div className="top-product-main">

                <div className="top-product-image">

                  {product.image ? (

                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.parentElement.classList.add(
                          "top-product-image-fallback"
                        );
                      }}
                    />

                  ) : (

                    <FaBoxOpen />

                  )}

                </div>


                <div className="top-product-info">

                  <strong>
                    {product.name}
                  </strong>

                  <span>
                    {product.category}
                  </span>

                </div>

              </div>


              {/* =================================================
                  SALES
              ================================================= */}

              <div className="top-product-sales">

                <span>
                  Units Sold
                </span>

                <strong>
                  {formatNumber(product.sales)}
                </strong>

              </div>


              {/* =================================================
                  REVENUE
              ================================================= */}

              <div className="top-product-revenue">

                <span>
                  Revenue
                </span>

                <strong>
                  ${formatMoney(product.revenue)}
                </strong>

              </div>


              {/* =================================================
                  GROWTH
              ================================================= */}

              <div
                className={`top-product-growth ${getGrowthClass(
                  product.growth
                )}`}
              >

                {getGrowthIcon(product.growth)}

                <span>
                  {Math.abs(product.growth).toFixed(1)}%
                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}

export default TopProducts;