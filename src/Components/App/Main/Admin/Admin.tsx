import React from "react";
import { Button } from "@mui/material";

export default class Admin extends React.Component<{}, {}> {
  render(): React.ReactNode {
    return (
      <div className="Admin">
        <Button variant="contained">Hello world</Button>
        <h2>Admin</h2>
      </div>
    );
  }
};