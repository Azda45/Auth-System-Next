import Link from "next/link";

export default function LogRegBar({ disableRegister = false, disableLogin = false }) {
    return (
        <div className="flex justify-center mb-6">
            <div className="flex">
                <Link
                    href={disableLogin ? "#" : "/login"}
                    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l ${disableLogin ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    aria-disabled={disableLogin}
                >
                    Login
                </Link>
                <Link
                    href={disableRegister ? "#" : "/register"}
                    className={`bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r ${disableRegister ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    aria-disabled={disableRegister}
                >
                    Register
                </Link>
            </div>
        </div>
    );
}
