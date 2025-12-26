import Modal from "@/components/Modal";
import VBox from "@/components/VBox";

const UpgradeRequestReview = ({
  isOpen,
  onClose,
  user,
  requestReason,
  onApprove,
  onReject,
}) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-center">
        <VBox className="min-w-[50%] space-y-10">
          {/* Header */}
          <h2 className="text-2xl font-bold">Upgrade Request</h2>

          {/* User Info */}
          <div className="space-y-1 text-gray-700">
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>User ID:</strong> {user.id}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>Status:</strong> {user.status}
            </p>
          </div>

          {/* Request Reason */}
          <div>
            <h3 className="font-semibold mb-1">Reason for Upgrade</h3>
            <p className="text-gray-600 p-2 bg-gray-100 rounded">
              {requestReason}
            </p>
          </div>

          {/* Optional Admin Comment */}
          <div>
            <h3 className="font-semibold mb-1">Admin Comment (optional)</h3>
            <textarea
              className="resize-none w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Add a note..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
          </div>
        </VBox>
      </div>
    </Modal>
  );
};

export default UpgradeRequestReview;
