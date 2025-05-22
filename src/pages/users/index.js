import { useState, useEffect } from "react";
import { useRouter } from 'next/router';

function formatRelativeDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000; // seconds
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return 'yesterday';
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          // Handle HTTP errors (e.g., 404, 500)
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! Status: ${response.status}`
          );
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch users');
        }
        
        setUsers(data.data);
      } catch (err) {
        console.error("Fetch error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!users.length) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-6 text-center">Users List</h3>
      <table className="table-auto w-full rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-gray-700 font-semibold">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Last Login</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr
              key={user._id}
              className={
                `transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`
              }
            >
              <td className="px-4 py-2 rounded-l-lg">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.role || '-'}</td>
              <td className="px-4 py-2 rounded-r-lg">{formatRelativeDate(user.lastLogin)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default UsersList;
