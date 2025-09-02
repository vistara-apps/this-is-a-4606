import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Alert from '../ui/Alert';
import { Printer, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const LabelGenerator = ({ order, onSuccess }) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [labelUrl, setLabelUrl] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleGenerateLabel = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const updatedOrder = await orderService.generateShippingLabel(order.orderId, user.id);
      
      setLabelUrl(updatedOrder.shippingLabelUrl);
      setTrackingNumber(updatedOrder.trackingNumber);
      setShowPreview(true);
      
      if (onSuccess) {
        onSuccess(updatedOrder);
      }
    } catch (error) {
      console.error('Error generating shipping label:', error);
      setError('Failed to generate shipping label. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open(labelUrl, '_blank');
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  };

  const handleDownload = () => {
    window.open(labelUrl, '_blank');
  };

  return (
    <>
      {order.status === 'Shipped' ? (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle size={16} />
            <span>Label Generated</span>
          </div>
          <div className="text-gray-400 text-sm">
            Tracking: <span className="text-white font-mono">{order.trackingNumber}</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer size={14} />}
              onClick={() => {
                setLabelUrl(order.shippingLabelUrl);
                handlePrint();
              }}
            >
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={() => {
                setLabelUrl(order.shippingLabelUrl);
                handleDownload();
              }}
            >
              Download
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <Button
            variant="primary"
            onClick={handleGenerateLabel}
            isLoading={isGenerating}
            disabled={isGenerating}
          >
            Generate Shipping Label
          </Button>
          {error && (
            <Alert variant="error" className="mt-2">
              {error}
            </Alert>
          )}
        </div>
      )}

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Shipping Label Generated"
        size="md"
        footer={
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => setShowPreview(false)}
            >
              Close
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                leftIcon={<Printer size={16} />}
                onClick={handlePrint}
              >
                Print Label
              </Button>
              <Button
                variant="primary"
                leftIcon={<Download size={16} />}
                onClick={handleDownload}
              >
                Download Label
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <Alert variant="success" title="Success">
            Shipping label has been generated successfully.
          </Alert>
          
          <div className="bg-dark-surface p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Tracking Number:</span>
              <span className="text-white font-mono">{trackingNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Carrier:</span>
              <span className="text-white">USPS</span>
            </div>
          </div>
          
          <div className="border border-dark-border rounded-lg overflow-hidden">
            <div className="aspect-w-8 aspect-h-11 bg-white">
              <iframe
                src={labelUrl}
                className="w-full h-full"
                title="Shipping Label"
              />
            </div>
          </div>
          
          <p className="text-gray-400 text-sm">
            The shipping label has been saved to your order and the tracking information has been updated in TikTok Shop.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default LabelGenerator;

