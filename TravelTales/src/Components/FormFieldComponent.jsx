import React from "react";

const FormField = ({ id, label, type = "text", placeholder, value, onChange, errors = [] }) => {
  return (
    <div className='mb-3'>
      <label htmlFor={id} className='form-label'>{label}</label>
      <input 
        id={id} 
        className='form-control' 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange} 
      />
      {errors.map((error, index) => (
        <p key={index} className='text-danger'>{error}</p>
      ))}
    </div>
  );
};

export default FormField;