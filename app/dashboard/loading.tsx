const DeveloperLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-12 h-12 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>

        {/* Inner Core */}
        <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-t-4 border-b-4 border-indigo-200 animate-spin-reverse"></div>
      </div>
    </div>
  );
};

// Add this to your tailwind.config.js for the reverse spin:
// module.exports = {
//   theme: {
//     extend: {
//       animation: {
//         'spin-reverse': 'spin 1s linear reverse infinite',
//       },
//     },
//   },
// };

export default DeveloperLoader;
