import {
  FaBell,
  FaSearch,
  FaMoon
} from "react-icons/fa";

const Topbar = () => {

  return (

    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">

      <div>

        <h2 className="text-2xl font-bold">

          Good Evening 👋

        </h2>

        <p className="text-gray-500">

          Welcome to BusyBiz

        </p>

      </div>

      <div className="flex items-center gap-4">

        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2">

          <FaSearch />

          <input
            type="text"
            placeholder="Search..."
            className="ml-2 bg-transparent outline-none"
          />

        </div>

        <button>

          <FaBell size={20} />

        </button>

        <button>

          <FaMoon size={20} />

        </button>

        <div className="w-11 h-11 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">

          A

        </div>

      </div>

    </header>

  );

};

export default Topbar;