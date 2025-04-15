import React, { useContext } from "react";
import { Navigate, Outlet } from 'react-router';
import { observer } from "mobx-react";
import { ApplicationContext } from "../../Store/ApplicationStore";


export default observer(({children}) => {
  const store = useContext(ApplicationContext);
  return (
    <div>
        { !store.session.exists && <Navigate to='/auth' />}
        { store.session.exists && children }
    </div>
  );
});
