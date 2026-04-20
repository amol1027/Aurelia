import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function AdoptionApplicationForm({ pet, onSuccess }) {
    const { user } = useAuth();
    const { success: showSuccess, error: showError } = useNotification();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        // Home environment
        homeType: 'house',
        homeOwnership: 'own',
        hasYard: false,
        yardFenced: false,
        
        // Other pets
        hasOtherPets: false,
        otherPetsDetails: '',
        
        // Children
        hasChildren: false,
        childrenAges: '',
        
        // Experience
        petExperience: '',
        previousPets: '',
        
        // References
        vetReference: '',
        vetPhone: '',
        personalReferenceName: '',
        personalReferencePhone: '',
        personalReferenceRelationship: '',
        
        // Application details
        reasonForAdoption: '',
        specialAccommodations: '',
        hoursAlonePerDay: '',
        exercisePlan: '',
        
        // Emergency contact
        emergencyContactName: '',
        emergencyContactPhone: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (user && Number(user.id) === Number(pet.ownerUserId)) {
            showError('You cannot adopt your own pet listing');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('aurelia_token');
            const response = await fetch('http://localhost:5000/api/adoptions/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    petId: pet.id,
                    ...formData,
                    hoursAlonePerDay: parseInt(formData.hoursAlonePerDay) || 0
                })
            });

            const data = await response.json();

            if (response.ok) {
                showSuccess('Application submitted successfully! 🎉');
                if (onSuccess) {
                    onSuccess(data.applicationId);
                } else {
                    navigate('/my-applications');
                }
            } else {
                showError(data.error || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Submit error:', error);
            showError('Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-accent-50 border border-accent-200 rounded-2xl p-6 text-center">
                <p className="text-accent-700 mb-4">Please log in to submit an adoption application</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition"
                >
                    Log In
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Home Environment */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-playfair font-bold text-accent-900 mb-4">Home Environment</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Home Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="homeType"
                            value={formData.homeType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="house">House</option>
                            <option value="apartment">Apartment</option>
                            <option value="condo">Condo</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Home Ownership <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="homeOwnership"
                            value={formData.homeOwnership}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="own">Own</option>
                            <option value="rent">Rent</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="hasYard"
                            checked={formData.hasYard}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-accent-700">I have a yard</span>
                    </label>

                    {formData.hasYard && (
                        <label className="flex items-center ml-6">
                            <input
                                type="checkbox"
                                name="yardFenced"
                                checked={formData.yardFenced}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="ml-2 text-accent-700">Yard is fenced</span>
                        </label>
                    )}
                </div>
            </section>

            {/* Other Pets */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-playfair font-bold text-accent-900 mb-4">Other Pets</h3>
                
                <label className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        name="hasOtherPets"
                        checked={formData.hasOtherPets}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-accent-700">I have other pets</span>
                </label>

                {formData.hasOtherPets && (
                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Please describe your other pets <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="otherPetsDetails"
                            value={formData.otherPetsDetails}
                            onChange={handleChange}
                            required={formData.hasOtherPets}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Include species, breeds, ages, and temperament"
                        />
                    </div>
                )}
            </section>

            {/* Children */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-playfair font-bold text-accent-900 mb-4">Children</h3>
                
                <label className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        name="hasChildren"
                        checked={formData.hasChildren}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-accent-700">I have children</span>
                </label>

                {formData.hasChildren && (
                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Children's Ages <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="childrenAges"
                            value={formData.childrenAges}
                            onChange={handleChange}
                            required={formData.hasChildren}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="e.g., 3, 7, 12"
                        />
                    </div>
                )}
            </section>

            {/* Experience */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-playfair font-bold text-accent-900 mb-4">Pet Experience</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Describe your experience with pets <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="petExperience"
                            value={formData.petExperience}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Tell us about your experience caring for pets, training, health care, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Previous Pets (optional)
                        </label>
                        <textarea
                            name="previousPets"
                            value={formData.previousPets}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="List any pets you've owned previously and how long you had them"
                        />
                    </div>
                </div>
            </section>

            {/* References */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-playfair font-bold text-accent-900 mb-4">References</h3>
                
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-accent-700 mb-2">
                                Veterinarian Name (optional)
                            </label>
                            <input
                                type="text"
                                name="vetReference"
                                value={formData.vetReference}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-accent-700 mb-2">
                                Veterinarian Phone (optional)
                            </label>
                            <input
                                type="tel"
                                name="vetPhone"
                                value={formData.vetPhone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-accent-700 mb-2">
                                Personal Reference Name
                            </label>
                            <input
                                type="text"
                                name="personalReferenceName"
                                value={formData.personalReferenceName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-accent-700 mb-2">
                                Reference Phone
                            </label>
                            <input
                                type="tel"
                                name="personalReferencePhone"
                                value={formData.personalReferencePhone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-accent-700 mb-2">
                                Relationship
                            </label>
                            <input
                                type="text"
                                name="personalReferenceRelationship"
                                value={formData.personalReferenceRelationship}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Friend, coworker, etc."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Care Plan */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-playfair font-bold text-accent-900 mb-4">Care Plan</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Why do you want to adopt {pet.name}? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="reasonForAdoption"
                            value={formData.reasonForAdoption}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Tell us why you'd like to adopt this pet and what you can offer them"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Hours Alone Per Day <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="hoursAlonePerDay"
                            value={formData.hoursAlonePerDay}
                            onChange={handleChange}
                            required
                            min="0"
                            max="24"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Exercise Plan
                        </label>
                        <textarea
                            name="exercisePlan"
                            value={formData.exercisePlan}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="How will you ensure the pet gets adequate exercise and mental stimulation?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Special Accommodations
                        </label>
                        <textarea
                            name="specialAccommodations"
                            value={formData.specialAccommodations}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Any special accommodations you can provide (e.g., medical care, behavioral support)"
                        />
                    </div>
                </div>
            </section>

            {/* Emergency Contact */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-playfair font-bold text-accent-900 mb-4">Emergency Contact</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Emergency Contact Name
                        </label>
                        <input
                            type="text"
                            name="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-accent-700 mb-2">
                            Emergency Contact Phone
                        </label>
                        <input
                            type="tel"
                            name="emergencyContactPhone"
                            value={formData.emergencyContactPhone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </section>

            {/* Submit */}
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-8 py-3 border border-gray-300 rounded-full text-accent-700 hover:bg-gray-50 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>
        </form>
    );
}
