import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TikTokConnection from './TikTokConnection';
import ShippingProfile from './ShippingProfile';
import SubscriptionPlan from './SubscriptionPlan';
import { CheckCircle, ArrowRight } from 'lucide-react';

const steps = [
  { id: 'connect', title: 'Connect TikTok Shop' },
  { id: 'shipping', title: 'Set Up Shipping' },
  { id: 'subscription', title: 'Choose a Plan' },
];

const OnboardingFlow = () => {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState({
    connect: false,
    shipping: false,
    subscription: false,
  });
  const [loading, setLoading] = useState(false);

  // Handle step completion
  const handleStepComplete = async (step) => {
    setCompleted(prev => ({ ...prev, [step]: true }));
    
    // If all steps are completed, mark onboarding as complete
    if (Object.values({ ...completed, [step]: true }).every(Boolean)) {
      setLoading(true);
      
      try {
        await updateProfile({ onboardingCompleted: true });
        navigate('/dashboard');
      } catch (error) {
        console.error('Error updating onboarding status:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Move to the next step
      setCurrentStep(prev => prev + 1);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'connect':
        return <TikTokConnection onComplete={() => handleStepComplete('connect')} />;
      case 'shipping':
        return <ShippingProfile onComplete={() => handleStepComplete('shipping')} />;
      case 'subscription':
        return <SubscriptionPlan onComplete={() => handleStepComplete('subscription')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
            <h1 className="text-2xl font-bold text-white">TikTokFlow</h1>
          </div>
        </div>
        
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-8 border border-dark-border">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Let's set up your TikTokFlow account
          </h2>
          
          {/* Progress steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  {/* Step circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        completed[step.id]
                          ? 'bg-green-500 text-white'
                          : index === currentStep
                          ? 'bg-purple-600 text-white'
                          : 'bg-dark-surface text-gray-400'
                      }`}
                    >
                      {completed[step.id] ? (
                        <CheckCircle size={20} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm ${
                        index === currentStep ? 'text-white font-medium' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        completed[step.id] ? 'bg-green-500' : 'bg-dark-surface'
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          {/* Current step content */}
          <div className="mt-8">
            {renderStep()}
          </div>
          
          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0 || loading}
              className="px-4 py-2 bg-dark-surface text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            <button
              onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
              disabled={currentStep === steps.length - 1 || !completed[steps[currentStep].id] || loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;

