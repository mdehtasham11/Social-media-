import { Skeleton } from "@/components/ui/skeleton";
import { Toaster, toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { getMediaUrl } from "../../utils/mediaUrl";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

const ExploreGrid = () => {
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["explore"],
    queryFn: () => api("/api/user/explore").then((r) => r.data),
  });

  return (
    <>
      <Toaster position="top-right" duration="4000" />
      <div className="flex flex-wrap gap-2 justify-center">
        {isLoading ? (
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
                  src={getMediaUrl(image.image)}
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
