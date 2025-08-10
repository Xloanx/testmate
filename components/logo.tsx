import { VscMortarBoard } from "react-icons/vsc";
const Logo = () => {
    return ( 
        <div className="flex flex-col items-center">
            <div className="relative">
            <VscMortarBoard className="w-8 h-8 text-indigo-600 absolute -top-6 left-1/2 transform -translate-x-1/2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent relative">
                Testmate <span className="text-gray-800">Pro</span>
            </span>
            </div>
        </div>
     );
}
 
export default Logo;
