import React from "react";
import { CollectionForm, CollectionFormProps } from "./CollectionForm";

export const FootwearReleaseForm: React.FC<Omit<CollectionFormProps, "releaseType">> = (props) => {
  return <CollectionForm {...props} releaseType="footwear" />;
};

export default FootwearReleaseForm;
