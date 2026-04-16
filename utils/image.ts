export const getImageUrl = (path: string | null | undefined): string => {
    if (!path || path === "") return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    let cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (!cleanPath.startsWith("/public")) cleanPath = `/public${cleanPath}`;
    return `${baseUrl}${cleanPath}`;
};