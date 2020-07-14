import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom'
import { createOrUpdateProfile, getCurrentProfile } from '../../actions/profille'
import { InputField, SocialInputField } from './CreateProfile';

const EditProfile = ({ profile: { profile, loading }, createOrUpdateProfile, getCurrentProfile, history }) => {

    const [formData, setFormData] = useState({
        status: '', company: '', website: '', location: '', twitter: '', facebook: '', skills: '', githubusername: '', bio: ''
    })

    const [displaySocialInputs, setDisplaySocialInputs] = useState(false)
    const { status, company, website, location, twitter, facebook, skills, githubusername, bio } = formData

    const inputFields = [
        { name: 'website', placeholder: 'Website', text: 'Could be your own or a company website', value: website },
        { name: 'company', placeholder: 'Company', text: 'Could be your own company or one you work for', value: company },
        { name: 'location', placeholder: 'Location', text: 'City & state suggested (eg. Boston, MA)', value: location },
        { name: 'skills', placeholder: 'Skills', text: '>Please use comma separated values (eg.HTML,CSS,JavaScript,PHP)', value: skills },
        { name: 'githubusername', placeholder: 'Github Username', text: 'If you want your latest repos and a Github link, include your username', value: githubusername },
    ]

    const socialLinks = [
        { name: 'twitter', placeholder: 'Twitter URL', icon: 'fab fa-twitter fa-2x', value: twitter },
        { name: 'facebook', placeholder: 'Facebook URL', icon: 'fab fa-facebook fa-2x', value: facebook },
    ]

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
    const handleSubmit = (e) => {
        e.preventDefault()
        createOrUpdateProfile(formData, history, true)
    }

    useEffect(() => {
        getCurrentProfile()
        setFormData({
            status: !loading && profile.data.status ? profile.data.status : '',
            company: !loading && profile.data.company ? profile.data.company : '',
            skills: !loading && profile.data.skills ? profile.data.skills.join(',') : '',
            website: !loading && profile.data.website ? profile.data.website : '',
            location: !loading && profile.data.location ? profile.data.location : '',
            githubusername: !loading && profile.data.githubusername ? profile.data.githubusername : '',
            bio: !loading && profile.data.bio ? profile.data.bio : '',
            twitter: !loading && profile.data.social ? profile.data.social.twitter : '',
            facebook: !loading && profile.data.social ? profile.data.social.facebook : '',
        })
    }, [loading])

    return (
        <>
            <section className="container">
                <h1 className="large text-primary">
                    Create Your Profile
                </h1>
                <p className="lead">
                    <i className="fas fa-user"></i> Let's get some information to make your profile stand out
                </p>
                <small>* = required field</small>
                <form className="form">
                    <div className="form-group">
                        <select name="status" value={status} onChange={e => handleChange(e)}>
                            <option value="0">* Select Professional Status</option>
                            <option value="Developer">Developer</option>
                            <option value="Junior Developer">Junior Developer</option>
                            <option value="Senior Developer">Senior Developer</option>
                            <option value="Manager">Manager</option>
                            <option value="Student or Learning">Student or Learning</option>
                            <option value="Instructor">Instructor or Teacher</option>
                            <option value="Intern">Intern</option>
                            <option value="Other">Other</option>
                        </select>
                        <small className="form-text">Give us an idea of where you are at in your career</small>
                    </div>
                    {
                        inputFields.map(field => <InputField key={field.name} field={field} handleChange={handleChange} />)
                    }
                    <div className="form-group">
                        <textarea placeholder="A short bio of yourself" value={bio} name="bio" onChange={e => handleChange(e)}></textarea>
                        <small className="form-text">Tell us a little about yourself</small>
                    </div>

                    <div className="my-2">
                        <button type="button" className="btn btn-light" onClick={() => setDisplaySocialInputs(!displaySocialInputs)}>
                            Add Social Network Links
                        </button>
                        <span>Optional</span>
                    </div>
                    {displaySocialInputs &&
                        <>
                            {
                                socialLinks.map(social => (<SocialInputField key={social.name} social={social} handleChange={handleChange} />))
                            }
                        </>
                    }

                    <input type="submit" className="btn btn-primary my-1" onClick={e => handleSubmit(e)} />
                    <Link className="btn btn-light my-1" to="/dashboard">Go Back</Link>
                </form>
            </section>
        </>
    );
};

EditProfile.propTypes = {
    createOrUpdateProfile: PropTypes.func.isRequired,
    getCurrentProfile: PropTypes.func.isRequired,
    profile: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
    profile: state.profile
})

export default connect(mapStateToProps, { createOrUpdateProfile, getCurrentProfile })(withRouter(EditProfile));