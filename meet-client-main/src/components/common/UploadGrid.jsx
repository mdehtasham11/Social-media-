import { useState } from "react";
import { CloudUpload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UploadGrid = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [isUploaded, setIsUploaded] = useState(false);

  const navigateTo = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setIsUploaded(true);
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploaded(true);
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);
    formData.append("visibility", visibility);
    const loadingToastId = toast.loading("Uploading please wait...");
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/user/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      if (!response.ok) {
        toast.dismiss(loadingToastId);
        toast.error("Something went wrong");
        const ss = await response.json();
        console.log(ss);
        return;
      }
      toast.dismiss(loadingToastId);
      toast.success("Uploaded Successfully");
      setTimeout(() => {
        navigateTo('/');
      }, 3000);
    } catch (error) {
      toast.error("Internal server error");
    }
  };

  return (
    <>
      <Toaster position="top-right" duration="4000" />
      <div className="flex-1 lg:mx-4 lg:my-4 bg-white py-8 px-6 mb-20 md:mb-20 lg:px-60 rounded-lg shadow-lg overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">
          Upload New Post
        </h2>
        <form onSubmit={handleUpload} className="flex flex-col space-y-6">
          <div>
            <label
              htmlFor="caption"
              className="block text-sm font-medium text-gray-700"
            >
              Caption
            </label>
            <input
              type="text"
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Write a caption..."
            />
          </div>
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Image
            </label>
            <div className="mt-1 flex items-center justify-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-md">
              <div className="text-center">
                <CloudUpload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
            {image && (
              <div className="mt-2 flex items-center space-x-2">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="h-24 w-36 rounded-md"
                />
                {isUploaded && (
                  <XCircle
                    onClick={handleRemoveImage}
                    className="h-6 w-6 text-red-500 cursor-pointer"
                  />
                )}
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="postLocation"
              className="block text-sm font-medium text-gray-700"
            >
              Post Location
            </label>
            <select
              id="postLocation"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="public">Public</option>
              <option value="friend">Friend</option>
            </select>
          </div>
          <div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UploadGrid;
