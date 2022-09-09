import User from "@/resources/user/user.interface";

function isAuthorized(currentUser: User, userId: string): boolean {
  const id = currentUser._id ? currentUser._id.toString() : '';
  return currentUser.role === 'admin' || id === userId;
}
export default isAuthorized
