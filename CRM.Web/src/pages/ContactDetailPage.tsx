import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ContactDetailView from '../components/views/ContactDetailView';

const ContactDetailPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Parse navigation state
    const contactIds: number[] = location.state?.contactIds || [];
    const currentId = Number(id);
    const currentIndex = contactIds.indexOf(currentId);

    // Calculate Next/Prev
    const hasNext = currentIndex !== -1 && currentIndex < contactIds.length - 1;
    const hasPrev = currentIndex !== -1 && currentIndex > 0;

    const handleNext = () => {
        if (hasNext) {
            navigate(`/contacts/${contactIds[currentIndex + 1]}`, { state: { contactIds } });
        }
    };

    const handlePrev = () => {
        if (hasPrev) {
            navigate(`/contacts/${contactIds[currentIndex - 1]}`, { state: { contactIds } });
        }
    };

    if (!id) return <div className="p-8 text-center text-slate-500">Invalid Contact ID</div>;

    const navProps = contactIds.length > 0 ? {
        onPrevious: handlePrev,
        onNext: handleNext,
        currentIndex,
        totalCount: contactIds.length,
        hasPrevious: hasPrev,
        hasNext: hasNext
    } : undefined;

    return <ContactDetailView contactId={currentId} navigation={navProps} />;
};

export default ContactDetailPage;
