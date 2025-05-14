import { FaClock } from 'react-icons/fa';

const Logo = () => {
  return (
    <div className="flex items-center mb-8">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
        <FaClock className="w-5 h-5" />
      </div>
      <h1 className="ml-3 text-xl font-semibold text-gray-900">TimeTrack</h1>
    </div>
  );
};

export default Logo;