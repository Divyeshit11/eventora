import {Link} from 'react-router'
import Button from "../Components/common/Button";
import Footer from "../Components/layout/Footer";
import Navbar from "../Components/layout/Navbar";

function NotFoundPage() {
    return (
        <div className="min-h-screen bg-surface text-white">
            <Navbar />

         <main className="flex min-h-[65vh] flex-col items-center justify-center px-4 text-center">
            <p className="text-7xl font-extrabold text-brand-500 sm:text-9xl">
                404
            </p>

            <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
                Page not Found
            </h1>

            <p className="mt-4 max-w-md text-slate-400">
                The page you are looking for doesn't exist or may have been moved.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/">
                <Button>Back to Home</Button>
                </Link>

                <Link to="/events">
                <Button variant='secondary'>Explore Events</Button>
                </Link>

            </div>
            </main>   

            <Footer />

        </div>
    )
}

export default NotFoundPage