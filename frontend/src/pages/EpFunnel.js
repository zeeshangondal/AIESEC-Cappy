import React, { useState, useEffect } from 'react';
import epsServices from '../APIs/epsServices';
import { Button, Modal, Form, Table, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { localStorageUtils } from '../APIs/localStorageUtils';
import CoolDiv from '../components/CoolDiv'
import usersServices from '../APIs/users';

export default function EpFunnel() {
    const [eps, setEps] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [currentEp, setCurrentEp] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPhase, setCurrentPhase] = useState(1);

    const [showConsiderationModal, setShowConsiderationModal] = useState(false);
    const [considerationData, setConsiderationData] = useState({
        opId: '',
        lc_entity: '',
        status: '' // Consideration status
    });
    function resetConsiderationDataForm() {
        setConsiderationData({
            opId: '',
            lc_entity: '',
            status: '' // Consideration status
        })
    }
    const navigate = useNavigate();

    if (!localStorageUtils.hasToken()) {
        navigate("/login")
    }

    useEffect(() => {
        async function fetchEps() {
            const response = await epsServices.getAllEPs();
            setEps(response.eps);
        }
        fetchEps();
    }, []);


    const resetModal = () => {
        setShowPopup(false);
        setCurrentEp({});
        setIsUpdating(false);
    };

    const handleAddOrUpdate = async () => {
        if (isUpdating) {
            await epsServices.updateEP(currentEp);
        } else {
            await epsServices.createEP(currentEp);
        }
        const response = await epsServices.getAllEPs();
        setEps(response.eps);
        resetModal();
    };
    const updateEpStatus = async (ep, newStatus) => {
        if (ep.status === newStatus)
            return
        var updatedEp = { ...ep, status: newStatus };
        if (newStatus === "Done") {
            setCurrentEp(ep); // Save current EP to state
            setShowConsiderationModal(true); // Show modal for consideration data
            return
        }
        if (newStatus === "Not Contacted") {
            updatedEp = { ...updatedEp, firstContacted: false }
        } else {
            updatedEp = { ...updatedEp, firstContacted: true }
        }
        await epsServices.updateEP(updatedEp);
        const newEps = eps.map(e => e._id === ep._id ? updatedEp : e);
        setEps(newEps);
    };

    const handleSubmitConsideration = async () => {
        const updatedEp = {
            ...currentEp,
            status: 'Done',
            consideration: considerationData
        };
        await epsServices.updateEP(updatedEp);
        setShowConsiderationModal(false);
        resetConsiderationDataForm()
        // Refresh EPS list after the update
        const newEps = eps.map(e => e._id === currentEp._id ? updatedEp : e);
        setEps(newEps);
    };

    const startUpdate = (ep) => {
        setCurrentEp(ep);
        setIsUpdating(true);
        setShowPopup(true);
    };

    const handleDispatchEmails = async () => {
        try {
            const confirmation = window.confirm("Are you sure you want to dispatch emails to the EPs?");
            if (confirmation) {
                let response = await usersServices.dispatchEmails();
                let msg = `Total EPs to be contacted: ${response.totalEpsCount}. Emails sent to ${response.emailsSentCount} EPs. ` + (response.emailsNotSentCount > 0 ? `Couldn't sent emails to ${response.emailsNotSentCount} EPs` : ``)
                response = await epsServices.getAllEPs();
                setEps(response.eps);
                alert(msg)
            }
        } catch (er) {
            alert("Emails couldn't be dispatched")
        }
    };
    const handleDelete = async (_id) => {
        const confirmation = window.confirm("Are you sure you want to delete this EP?");
        if (confirmation) {
            await epsServices.deleteEP(_id);
            const updatedEps = eps.filter(ep => ep._id !== _id);
            setEps(updatedEps);
        }
    };

    const isInputValid = () => {
        return currentEp.epId && currentEp.name && currentEp.contact && currentEp.email;
    };

    //this filder is only for attraction phase
    const attractionPhaseFilteredEps = eps.filter(ep => {
        const query = searchQuery.toLowerCase();
        return ep.epId.toLowerCase().includes(query) ||
            ep.name.toLowerCase().includes(query) ||
            ep.email.toLowerCase().includes(query) ||
            (ep.assigned_TL && ep.assigned_TL.toLowerCase().includes(query)) ||
            (ep.assigned_Member && ep.assigned_Member.toLowerCase().includes(query)) ||
            (ep.status && ep.status.toLowerCase().includes(query));
    });

    const unassignedEpsCount = attractionPhaseFilteredEps.filter(ep => (!ep.assigned_TL || ep.assigned_TL === '-') && (!ep.assigned_Member || ep.assigned_Member === '-')).length;

    let sr = 0


    const handleConsiderationEpStatusUpdate = async (ep, newStatus) => {
        if (ep.consideration.status === newStatus)
            return
        if (newStatus === "Done (Approved)") {
            while (true) {
                let userInput = prompt("Please enter the OP Start-End dates in format: May 10, 2023 - June 15, 2023", "");
                if (userInput != null) {
                    if (userInput.length < 25) {
                        alert("Please enter realzation dates in correct format")
                        continue
                    }
                    let updatedEp = { ...ep, consideration: { ...ep.consideration, status: newStatus }, preparation: { ...ep.preparation, realizationDates: userInput } }
                    await epsServices.updateEP(updatedEp);
                    const newEps = eps.map(e => e._id === ep._id ? updatedEp : e);
                    setEps(newEps);
                    return
                } else {
                    return
                }
            }
        }
        let updatedEp = { ...ep, consideration: { ...ep.consideration, status: newStatus } }
        await epsServices.updateEP(updatedEp);
        const newEps = eps.map(e => e._id === ep._id ? updatedEp : e);
        setEps(newEps);
    };
    const AttractionPhase = <div>
        <div className="d-flex justify-content-between">
            <p style={{ fontSize: '0.8rem' }}>Unassigned EPs: {unassignedEpsCount}</p>
            <Button size="sm" variant="primary" onClick={() => setShowPopup(true)}>Add EP</Button>
        </div>

        <Modal show={showPopup} onHide={resetModal}>
            <Modal.Header closeButton>
                <Modal.Title>{isUpdating ? 'Update EP' : 'Add EP'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Control
                        required
                        type="text"
                        placeholder="EP ID"
                        value={currentEp.epId || ''}
                        onChange={e => setCurrentEp({ ...currentEp, epId: e.target.value })}
                    />
                </Form.Group>
                <br />
                <Form.Group>
                    <Form.Control
                        required
                        type="text"
                        placeholder="Name"
                        value={currentEp.name || ''}
                        onChange={e => setCurrentEp({ ...currentEp, name: e.target.value })}
                    />
                </Form.Group>
                <br />
                <Form.Group>
                    <Form.Control
                        required
                        type="text"
                        placeholder="Contact"
                        value={currentEp.contact || ''}
                        onChange={e => setCurrentEp({ ...currentEp, contact: e.target.value })}
                    />
                </Form.Group>
                <br />
                <Form.Group>
                    <Form.Control
                        required
                        type="email"
                        placeholder="Email"
                        value={currentEp.email || ''}
                        onChange={e => setCurrentEp({ ...currentEp, email: e.target.value })}
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={resetModal}>Close</Button>
                <Button
                    variant="success"
                    onClick={handleAddOrUpdate}
                    disabled={!isInputValid()}
                >
                    {isUpdating ? 'Update' : 'Add'}
                </Button>
            </Modal.Footer>
        </Modal>
        <Table hover size="sm" style={{ fontSize: '0.8rem' }}>
            <thead>
                <tr>
                    <th>Sr.No</th>
                    <th>EP ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th className='col-1'>Email</th>
                    <th>Assigned TL</th>
                    <th>Assigned Member</th>
                    <th className='col-2'>Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {attractionPhaseFilteredEps.map(ep => (
                    <tr key={ep.epId} >
                        <td className='py-2'>{++sr}</td>
                        <td className='py-2'>{ep.epId}</td>
                        <td className='py-2'>{ep.name}</td>
                        <td className='py-2'>{ep.contact}</td>
                        <td className='py-2 col-1'>{ep.email}</td>
                        <td className='py-2'>{ep.assigned_TL}</td>
                        <td className='py-2'>{ep.assigned_Member}</td>
                        <td className='col-1'>
                            <Form.Group >
                                <Form.Select size="sm" style={{ fontSize: '0.8rem' }}
                                    value={ep.status}
                                    onChange={(e) => updateEpStatus(ep, e.target.value)}
                                >
                                    <option value="Not Contacted">Not Contacted</option>
                                    <option value="Email Contacted">Email Contacted</option>
                                    <option value="Whatsapp Contacted">Whatsapp Contacted</option>
                                    <option value="Responded">Responded</option>
                                    <option value="Wrong Product">Wrong Product</option>
                                    <option value="Not Intereseted">Not Intereseted</option>
                                    <option value="Irresponsive">Irresponsive</option>
                                    <option value="Done">Done</option>
                                </Form.Select>
                            </Form.Group>
                        </td>
                        <td>
                            <div className='d-flex justify-content-between'>
                                <Button variant="warning" style={{ fontSize: '0.8rem' }} size="sm" onClick={() => startUpdate(ep)}>Update</Button>
                                <Button variant="danger" style={{ fontSize: '0.8rem' }} size="sm" onClick={() => handleDelete(ep._id)}>Delete</Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    </div>
    function getConsiderationEps() {
        return eps.filter(ep => ep.status === 'Done');
    }

    const considerationEps = getConsiderationEps()

    function handleConsiderationEpUpdate(ep) {
        setCurrentEp(ep); // Save current EP to state
        setConsiderationData({
            opId: ep.consideration.opId,
            lc_entity: ep.consideration.lc_entity,
            status: ep.consideration.status
        })
        setShowConsiderationModal(true); // Show modal for consideration data
    }
    //this filder is only for consideration phase
    const considerationPhaseFilteredEps = considerationEps.filter(ep => {
        const query = searchQuery.toLowerCase();
        return ep.epId.toLowerCase().includes(query) ||
            ep.name.toLowerCase().includes(query) ||
            ep.consideration.opId.toLowerCase().includes(query) ||
            ep.consideration.lc_entity.toLowerCase().includes(query) ||
            (ep.assigned_TL && ep.assigned_TL.toLowerCase().includes(query)) ||
            (ep.assigned_Member && ep.assigned_Member.toLowerCase().includes(query)) ||
            (ep.consideration.status && ep.consideration.status.toLowerCase().includes(query));
    });

    const ConsiderationPhase = <div>
        <div className="d-flex justify-content-start">
            <p style={{ fontSize: '0.8rem' }}></p>
        </div>

        <Table hover size="sm" style={{ fontSize: '0.8rem' }}>
            <thead>
                <tr>
                    <th>Sr.No</th>
                    <th>EP ID</th>
                    <th>Name</th>
                    <th>OP ID</th>
                    <th>Assigned TL</th>
                    <th>Assigned Member</th>
                    <th>LC Entity</th>
                    <th className='col-2'>Status</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {considerationPhaseFilteredEps.map((ep, index) => (
                    <tr key={ep.epId}>
                        <td className='py-2'>{index + 1}</td>
                        <td className='py-2'>{ep.epId}</td>
                        <td className='py-2'>{ep.name}</td>
                        <td className='py-2'>{ep.consideration.opId}</td>
                        <td className='py-2'>{ep.assigned_TL}</td>
                        <td className='py-2'>{ep.assigned_Member}</td>
                        <td className='py-2'>{ep.consideration.lc_entity}</td>
                        <td>
                            <Form.Group >
                                <Form.Select size="sm" style={{ fontSize: '0.8rem' }}
                                    value={ep.consideration.status}
                                    onChange={(e) => handleConsiderationEpStatusUpdate(ep, e.target.value)}
                                >
                                    <option value="Applied">Applied</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Waiting on Payment">Waiting on Payment</option>
                                    <option value="Contract Signed">Contract Signed</option>
                                    <option value="Done (Approved)">Done (Approved)</option>
                                    <option value="Approval Broken">Approval Broken</option>
                                    <option value="Apply Break">Apply Break</option>
                                </Form.Select>
                            </Form.Group>
                        </td>
                        <td>
                            <Button variant="warning" style={{ fontSize: '0.8rem' }} size="sm" onClick={() => handleConsiderationEpUpdate(ep)}>Update</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    </div>


    function getPreparationEps() {
        return eps.filter(ep => ep.status === 'Done' && ep.consideration.status === 'Done (Approved)');
    }

    const preparationEps = getPreparationEps()
    //this filder is only for preparation phase
    const preparationPhaseFilteredEps = preparationEps.filter(ep => {
        const query = searchQuery.toLowerCase();
        return ep.epId.toLowerCase().includes(query) ||
            ep.name.toLowerCase().includes(query) ||
            ep.consideration.opId.toLowerCase().includes(query) ||
            ep.consideration.lc_entity.toLowerCase().includes(query) ||
            (ep.assigned_TL && ep.assigned_TL.toLowerCase().includes(query)) ||
            (ep.assigned_Member && ep.assigned_Member.toLowerCase().includes(query)) ||
            (ep.preparation.realizationDates && ep.preparation.realizationDates.toLowerCase().includes(query))
    });

    const handlePreparationStatusesChange = async (ep, statusType, value) => {
        let updatedEp = { ...ep, preparation: { ...ep.preparation, [statusType]: value } }
        await epsServices.updateEP(updatedEp);
        const newEps = eps.map(e => e._id === ep._id ? updatedEp : e);
        setEps(newEps);
    }

    const handleRealizationDatesUpdate = async (ep) => {
        while (true) {
            let userInput = prompt("Update enter the OP Start-End dates in format: May 10, 2023 - June 15, 2023", ep.preparation.realizationDates);
            if (userInput != null) {
                if (userInput.length < 25) {
                    alert("Please enter realzation dates in correct format")
                    continue
                }
                let updatedEp = { ...ep, preparation: { ...ep.preparation, realizationDates: userInput } }
                await epsServices.updateEP(updatedEp);
                const newEps = eps.map(e => e._id === ep._id ? updatedEp : e);
                setEps(newEps);
                return
            } else {
                return
            }
        }
    }
    const PreparationPhase = <div>
        <div className="d-flex justify-content-start">
            <p style={{ fontSize: '0.8rem' }}></p>
        </div>

        <Table hover size="sm" style={{ fontSize: '0.8rem' }}>
            <thead>
                <tr>
                    <th>Sr.No</th>
                    <th>EP ID</th>
                    <th>Name</th>
                    <th>OP ID</th>
                    <th>Assigned TL</th>
                    <th>Assigned Member</th>
                    <th>LC Entity</th>
                    <th>OP Start-End Dates</th>
                    <th>PGS</th>
                    <th>OPS</th>
                    <th>Insurance</th>
                    <th>Visa</th>
                    <th>Tickets</th>
                    <th>Departed</th>
                </tr>
            </thead>
            <tbody>
                {preparationPhaseFilteredEps.map((ep, index) => (
                    <tr key={ep.epId}>
                        <td className='py-2'>{index + 1}</td>
                        <td className='py-2'>{ep.epId}</td>
                        <td className='py-2'>{ep.name}</td>
                        <td className='py-2'>{ep.consideration.opId}</td>
                        <td className='py-2'>{ep.assigned_TL}</td>
                        <td className='py-2'>{ep.assigned_Member}</td>
                        <td className='py-2'>{ep.consideration.lc_entity}</td>
                        <td className='py-2' style={{ cursor: 'pointer' }} onClick={(e) => handleRealizationDatesUpdate(ep)}> {ep.preparation.realizationDates}</td>
                        <td className='py-2'>
                            <Form.Check
                                type="checkbox"
                                checked={ep.preparation.PGS}
                                onChange={(e) => handlePreparationStatusesChange(ep, 'PGS', e.target.checked)}
                            />
                        </td>
                        <td className='py-2'>
                            <Form.Check
                                type="checkbox"
                                checked={ep.preparation.OPS}
                                onChange={(e) => handlePreparationStatusesChange(ep, 'OPS', e.target.checked)}
                            />
                        </td>
                        <td className='py-2'>
                            <Form.Check
                                type="checkbox"
                                checked={ep.preparation.Insurance}
                                onChange={(e) => handlePreparationStatusesChange(ep, 'Insurance', e.target.checked)}
                            />
                        </td>
                        <td className='py-2'>
                            <Form.Check
                                type="checkbox"
                                checked={ep.preparation.Visa}
                                onChange={(e) => handlePreparationStatusesChange(ep, 'Visa', e.target.checked)}
                            />
                        </td>
                        <td className='py-2'>
                            <Form.Check
                                type="checkbox"
                                checked={ep.preparation.Tickets}
                                onChange={(e) => handlePreparationStatusesChange(ep, 'Tickets', e.target.checked)}
                            />
                        </td>
                        <td className='py-2'>
                            <Form.Check
                                type="checkbox"
                                checked={ep.preparation.Departed}
                                onChange={(e) => handlePreparationStatusesChange(ep, 'Departed', e.target.checked)}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    </div>

    function getOnExperienceEps() {
        return eps.filter(ep => ep.status === 'Done' && ep.consideration.status === 'Done (Approved)' && ep.preparation.Departed == true);
    }

    const onExperienceEps = getOnExperienceEps()
    //this filder is only for on experience phase
    const onExperiencePhaseFilteredEps = onExperienceEps.filter(ep => {
        const query = searchQuery.toLowerCase();
        return ep.epId.toLowerCase().includes(query) ||
            ep.name.toLowerCase().includes(query) ||
            ep.consideration.opId.toLowerCase().includes(query) ||
            ep.experience.project.toLowerCase().includes(query) ||
            ep.consideration.lc_entity.toLowerCase().includes(query) ||
            ep.experience.status.toLowerCase().includes(query) ||
            (ep.assigned_TL && ep.assigned_TL.toLowerCase().includes(query)) ||
            (ep.assigned_Member && ep.assigned_Member.toLowerCase().includes(query)) ||
            (ep.preparation.realizationDates && ep.preparation.realizationDates.toLowerCase().includes(query))
    });

    const handleExperienceUpdate = async (ep, type, promptMsg) => {
        let userInput = prompt(promptMsg, ep.experience[type]);
        if (userInput != null) {
            let updatedEp = { ...ep, experience: { ...ep.experience, [type]: userInput } }
            await epsServices.updateEP(updatedEp);
            const newEps = eps.map(e => e._id === ep._id ? updatedEp : e);
            setEps(newEps);
        } else {
            return
        }
    }

    const handleExperienceEpStatusUpdate = async (ep, newStatus) => {
        if (ep.status === newStatus)
            return
        var updatedEp = { ...ep, experience: { ...ep.experience, status: newStatus } };
        await epsServices.updateEP(updatedEp);
        const newEps = eps.map(e => e._id === ep._id ? updatedEp : e);
        setEps(newEps);
    }

    const OnExperiencePhase = <div>
        <div className="d-flex justify-content-start">
            <p style={{ fontSize: '0.8rem' }}></p>
        </div>

        <Table hover size="sm" style={{ fontSize: '0.8rem' }}>
            <thead>
                <tr>
                    <th>Sr.No</th>
                    <th>EP ID</th>
                    <th>Name</th>
                    <th>OP ID</th>
                    <th>OPM Name</th>
                    <th>OPM Contact</th>
                    <th>Project</th>
                    <th>Assigned TL</th>
                    <th>Assigned Member</th>
                    <th>LC Entity</th>
                    <th>OP Start-End Dates</th>
                    <th>Status</th>

                </tr>
            </thead>
            <tbody>
                {onExperiencePhaseFilteredEps.map((ep, index) => (
                    <tr key={ep.epId}>
                        <td className='py-2'>{index + 1}</td>
                        <td className='py-2'>{ep.epId}</td>
                        <td className='py-2'>{ep.name}</td>
                        <td className='py-2'>{ep.consideration.opId}</td>
                        <td className='py-2' style={{ cursor: 'pointer' }} onClick={(e) => handleExperienceUpdate(ep, 'opmName', "Update OP Manager Name")}>{ep.experience.opmName}</td>
                        <td className='py-2' style={{ cursor: 'pointer' }} onClick={(e) => handleExperienceUpdate(ep, 'opmContact', "Update OP Manager Contact")}>{ep.experience.opmContact}</td>
                        <td className='py-2' style={{ cursor: 'pointer' }} onClick={(e) => handleExperienceUpdate(ep, 'project', "Update Project Name")}>{ep.experience.project}</td>
                        <td className='py-2'>{ep.assigned_TL}</td>
                        <td className='py-2'>{ep.assigned_Member}</td>
                        <td className='py-2'>{ep.consideration.lc_entity}</td>
                        <td className='py-2' style={{ cursor: 'pointer' }} onClick={(e) => handleRealizationDatesUpdate(ep)}> {ep.preparation.realizationDates}</td>
                        <Form.Group>
                            <Form.Select size="sm" style={{ fontSize: '0.8rem' }}
                                value={ep.experience.status}
                                onChange={(e) => handleExperienceEpStatusUpdate(ep, e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="On Experience">On Experience</option>
                                <option value="Realization Break">Realization Break</option>
                                <option value="Done (Experience)">Done (Experience)</option>

                            </Form.Select>
                        </Form.Group>
                        {/* <td className='py-2'>{ep.experience.status}</td> */}

                    </tr>
                ))}
            </tbody>
        </Table>
    </div>

    function getPostExperienceEps() {
        return eps.filter(ep => ep.status === 'Done' && ep.consideration.status === 'Done (Approved)' && ep.preparation.Departed == true && ep.experience.status === "Done (Experience)");
    }

    const postExperienceEps = getPostExperienceEps()
    //this filder is only for post experience phase
    const postExperiencePhaseFilteredEps = postExperienceEps.filter(ep => {
        const query = searchQuery.toLowerCase();
        return ep.epId.toLowerCase().includes(query) ||
            ep.name.toLowerCase().includes(query) ||
            ep.consideration.opId.toLowerCase().includes(query) ||
            ep.experience.project.toLowerCase().includes(query) ||
            ep.consideration.lc_entity.toLowerCase().includes(query) ||
            ep.experience.debriefStatus.toLowerCase().includes(query) ||
            (ep.assigned_TL && ep.assigned_TL.toLowerCase().includes(query)) ||
            (ep.assigned_Member && ep.assigned_Member.toLowerCase().includes(query)) ||
            (ep.preparation.realizationDates && ep.preparation.realizationDates.toLowerCase().includes(query))
    });
    const handleDebriefEpStatusUpdate = async (ep, newStatus) => {
        if (ep.status === newStatus)
            return
        var updatedEp = { ...ep, experience: { ...ep.experience, debriefStatus: newStatus } };
        await epsServices.updateEP(updatedEp);
        const newEps = eps.map(e => e._id === ep._id ? updatedEp : e);
        setEps(newEps);
    }

    

    const PostExperiencePhase = <div>
        <div className="d-flex justify-content-start">
            <p style={{ fontSize: '0.8rem' }}></p>
        </div>

        <Table hover size="sm" style={{ fontSize: '0.8rem' }}>
            <thead>
                <tr>
                    <th>Sr.No</th>
                    <th>EP ID</th>
                    <th>Name</th>
                    <th>OP ID</th>
                    <th>Project</th>
                    <th>Assigned TL</th>
                    <th>Assigned Member</th>
                    <th>LC Entity</th>
                    <th>OP Start-End Dates</th>
                    <th>Debrief Status</th>

                </tr>
            </thead>
            <tbody>
                {postExperiencePhaseFilteredEps.map((ep, index) => (
                    <tr key={ep.epId}>
                        <td className='py-2'>{index + 1}</td>
                        <td className='py-2'>{ep.epId}</td>
                        <td className='py-2'ee>{ep.name}</td>
                        <td className='py-2'>{ep.consideration.opId}</td>
                        <td className='py-2' style={{ cursor: 'pointer' }} onClick={(e) => handleExperienceUpdate(ep, 'project', "Update Project Name")}>{ep.experience.project}</td>
                        <td className='py-2'>{ep.assigned_TL}</td>
                        <td className='py-2'>{ep.assigned_Member}</td>
                        <td className='py-2'>{ep.consideration.lc_entity}</td>
                        <td className='py-2' style={{ cursor: 'pointer' }} onClick={(e) => handleRealizationDatesUpdate(ep)}> {ep.preparation.realizationDates}</td>
                        
                        <Form.Group>
                            <Form.Select size="sm" style={{ fontSize: '0.8rem' }}
                                value={ep.experience.debriefStatus}
                                onChange={(e) => handleDebriefEpStatusUpdate(ep, e.target.value)}
                            >
                                <option value="--">--</option>
                                <option value="Done (Debrief)">Done</option>

                            </Form.Select>
                        </Form.Group>

                    </tr>
                ))}
            </tbody>
        </Table>
    </div>


    function getQueryPLaceHolder() {
        if (currentPhase === 1)
            return "Search... EP ID, Name, Email, Status, Assigned TL, Assigned Member"
        if (currentPhase === 2)
            return "Search... EP ID, Name, OP ID, Status, LC | Entity ,Assigned TL, Assigned Member"
        if (currentPhase === 3)
            return "Search... EP ID, Name, OP ID, LC | Entity, OP Start-End Date ,Assigned TL, Assigned Member"
        if (currentPhase === 4)
            return "Search... EP ID, Name, OP ID, Project, Status, LC | Entity, OP Start-End Date ,Assigned TL, Assigned Member"
        if (currentPhase === 5)
            return "Search... EP ID, Name, OP ID, Project, Debrief Status, LC | Entity, OP Start-End Date ,Assigned TL, Assigned Member"
        
    }
    let queryPlaceHolder = getQueryPLaceHolder()
    return (
        <div className="container mt-3">
            <CoolDiv>
                <h1 className="text-center">EP Funnel</h1>
                <hr />
                <div className='d-flex justify-content-between'>
                    <Form.Control
                        type="text"
                        placeholder={queryPlaceHolder}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '70%', marginRight: '10px' }}
                    />
                    {currentPhase === 1 ? <Button size='sm' style={{ backgroundColor: '#6200ea' }} onClick={handleDispatchEmails}>Dispatch Emails</Button> : ''}
                </div>
            </CoolDiv>
            <br />
            <div className="d-flex mb-2">
                <Button size='sm' variant={currentPhase === 1 ? 'primary' : 'light'} onClick={() => setCurrentPhase(1)} style={{ outline: 'none', boxShadow: 'none' }} >Attraction Phase</Button>
                <Button size='sm' variant={currentPhase === 2 ? 'primary' : 'light'} onClick={() => setCurrentPhase(2)} style={{ outline: 'none', boxShadow: 'none', marginLeft: '2px' }}>Consideration Phase</Button>
                <Button size='sm' variant={currentPhase === 3 ? 'primary' : 'light'} onClick={() => setCurrentPhase(3)} style={{ outline: 'none', boxShadow: 'none', marginLeft: '2px' }}>Preparation Phase</Button>
                <Button size='sm' variant={currentPhase === 4 ? 'primary' : 'light'} onClick={() => setCurrentPhase(4)} style={{ outline: 'none', boxShadow: 'none', marginLeft: '2px' }}>On Experience</Button>
                <Button size='sm' variant={currentPhase === 5 ? 'primary' : 'light'} onClick={() => setCurrentPhase(5)} style={{ outline: 'none', boxShadow: 'none', marginLeft: '2px' }}>Post Experience</Button>
            </div>

            {currentPhase === 1 && AttractionPhase}
            {currentPhase === 2 && ConsiderationPhase}
            {currentPhase === 3 && PreparationPhase}
            {currentPhase === 4 && OnExperiencePhase}
            {currentPhase === 5 && PostExperiencePhase}

            <Modal show={showConsiderationModal} onHide={() => setShowConsiderationModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter EP Consideration Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>OP ID</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                value={considerationData.opId}
                                onChange={(e) => setConsiderationData({ ...considerationData, opId: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className='mt-3'>
                            <Form.Label>LC Entity</Form.Label>
                            <Form.Control
                                type="text"
                                value={considerationData.lc_entity}
                                required
                                onChange={(e) => setConsiderationData({ ...considerationData, lc_entity: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className='mt-3'>
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={considerationData.status}
                                onChange={(e) => setConsiderationData({ ...considerationData, status: e.target.value })}
                                required
                            >
                                <option value="">Select</option>
                                <option value="Applied">Applied</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Waiting on Payment">Waiting on Payment</option>
                                <option value="Contract Signed">Contract Signed</option>
                                <option value="Approval Broken">Approval Broken</option>
                                <option value="Apply Break">Apply Break</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConsiderationModal(false)}>Close</Button>
                    <Button variant="primary" disabled={(considerationData.opId === "" || considerationData.lc_entity === "" || considerationData.status === "") ? true : false} onClick={handleSubmitConsideration}>Submit</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
