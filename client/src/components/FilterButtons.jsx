import "./FilterButtons.css";

const categories = [
  "All",
  "Music",
  "Gaming",
  "Education",
  "Entertainment",
  "Sports",
  "News",
  "Technology",
  "Travel"
];

const FilterButtons = ({ activeFilter, setActiveFilter }) => {
  return (
    <div className="filter-container">
      {categories.map((category, index) => (
        <button
          key={index}
          className={`filter-btn ${activeFilter === category ? "active" : ""}`}
          onClick={() => setActiveFilter(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
