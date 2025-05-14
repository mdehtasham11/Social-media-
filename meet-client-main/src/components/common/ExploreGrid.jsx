import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link } from "react-router-dom";
const ExploreGrid = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGetImages = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/explore`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        toast.error("Error while fetching data");
        return;
      }

      const postData = await response.json();
      setImages(postData.data);
      setLoading(true);
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  useEffect(() => {
    handleGetImages();
  }, []);

  return (
    <>
      <Toaster position="top-right" duration="4000" />
      <div className="flex flex-wrap gap-2 justify-center">
        {!loading ? (
          [1, 2, 3, 4, 5, 6].map((_, index) => (
            <div
              key={index}
              className="relative w-[46%] md:w-[48%] lg:w-[42%] p-2 no-scrollbar">
              <Skeleton className="h-[150px] w-[100%] md:h-[300px] lg:h-[400px] rounded-xl" />
            </div>
          ))
        ) : images && images.length > 0 ? (
          images.map((image, index) => (
            <Link
              to={`/post/${image._id}`}
              key={index}
              className="relative w-[46%] md:w-[48%] lg:w-[42%] p-2"
            >
              <div className="w-[100%] h-[100%] overflow-hidden rounded-lg shadow-md transform transition duration-300 hover:shadow-lg hover:scale-105">
                <img
                  src={image.image}
                  alt={`Explore ${index}`}
                  className="object-cover w-full h-full"
                />
              </div>
            </Link>
          ))
        ) : (
          <p>No images to display</p>
        )}
      </div>
    </>
  );
};

export default ExploreGrid;
