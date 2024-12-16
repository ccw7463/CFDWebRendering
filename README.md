# CFDWebRendering

## Overview
CFDWebRendering is a tool for simulating and rendering 2D fluid flow. It allows users to customize various parameters, including obstacles, density, viscosity, and velocity. Additionally, it provides default settings for ease of use. The rendering displays fluid velocity through color variation, and users can toggle obstacle visibility on or off.

## How to Run
To run the application, use the following command in your terminal:
```bash
python3 -m http.server 8000
```
This command will start a local server, and you can access the simulation via your web browser.

## Features
- **2D Fluid Flow Simulation**: Visualize the behavior of fluid flow in a 2D space.
- **Customizable Parameters**: Adjust the following parameters as needed:
  - **Obstacle**: Enable or disable obstacles in the flow.
  - **Density**: Set the density of the fluid.
  - **Viscosity**: Control the viscosity of the fluid.
  - **Velocity**: Adjust the speed and direction of the fluid flow.
- **Dynamic Rendering**: Fluid velocity is represented using different colors to visualize changes and flow speed.

## Usage Instructions
1. **Launch the Server**: Run the following command:
   ```bash
   python3 -m http.server 8000
   ```
2. **Open the Browser**: Open your preferred web browser and navigate to:
   ```
   http://localhost:8000
   ```
3. **Interact with the Simulation**: Use the provided interface to adjust parameters like obstacle placement, density, viscosity, and velocity. Observe how the changes affect the fluid flow in real-time.

## Customization Options
- **Obstacle On/Off**: Toggle the presence of obstacles in the simulation.
- **Density**: Modify the density of the fluid to see how it influences the flow.
- **Viscosity**: Change the viscosity to analyze the impact on fluid behavior.
- **Velocity**: Adjust the velocity to control the speed and direction of the flow.

## Rendering Details
The simulation visualizes fluid velocity using color variation. Higher velocities are displayed with more vibrant or distinct colors, providing a clear visual representation of changes in flow speed.

## Demo
![demo](public/demo.gif)


## Reference
This project is inspired by the Vortex Shedding project. For more details, visit the following repository:
[https://github.com/amandaghassaei/VortexShedding](https://github.com/amandaghassaei/VortexShedding)