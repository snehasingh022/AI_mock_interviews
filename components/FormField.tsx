import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Controller,FieldValues,Path,Control } from 'react-hook-form';
interface FormFieldProps<T extends FieldValues>{
    control:Control<T>;
    name:Path<T>;
    label:string;
    placeholder?:String;
    type:'text'|'email'|'password'|'file'
}

const FormFieldComponent = ({control,name,label,placeholder,type='text'}:FormFieldProps<T>) => (
 <Controller
 control={control}  
 name={name} 
 render={({field})=>(
<FormItem>
        <FormLabel className='label'>{label}</FormLabel>
        <FormControl>
          <Input className="input" placeholder={placeholder} {...field} />
        </FormControl>
        
        <FormMessage />
      </FormItem>
)}
      
    
  />
);

export default FormFieldComponent;
