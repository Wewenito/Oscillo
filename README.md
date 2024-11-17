# 🌌 AGATA Oscilloscope Web Application 🌐

*Real-time data acquisition & visualization at your fingertips!*

## 📖 Overview

The AGATA Oscilloscope Web Application is a tool combining Python and Django to emulate oscilloscope-like functionality in your browser. Designed for real-time gamma-ray data analysis, the application offers:

### ✨ Features:

* Acquire and process live electrical signals from an acquisition card via a TCP stream.
* Access and analyze previously recorded electrical signals stored in .osc files.
* Retrieve and interpret raw data from past experiments delivered through a third-party server.
* Dynamically adjust timeframes and amplitude ranges to focus on specific data points for detailed analysis.
* Customize data visualizations to suit individual needs with flexible display options.
* Leverage mathematical tools for comprehensive data analysis and transformations.
* Utilize standard oscilloscope functionalities, such as triggers and measurements, for thorough data examination.

*This project is built for scientists and researchers who require precision and efficiency in their gamma-ray spectroscopy workflows.*

## 🌌 The AGATA Project

**AGATA (Advanced Gamma Tracking Array)** is a European research project aimed at developing and constructing a next-generation 4pi gamma-ray spectrometer. This cutting-edge tool will be utilized in experiments with both intense, stable, and radioactive ion beams to explore the structure of atomic nuclei based on angular momentum, isospin, and temperature at the limits of their stability.

### 🎯 Design Highlights:
* 180 HPGe Crystals for unmatched gamma-ray detection.
* 36 Electrical Segments per Crystal for precise tracking.
* Seamless Spectroscopy with stable & radioactive ion beams.

*Learn more about AGATA [here](https://www.in2p3.cnrs.fr/fr/cnrsinfo/agata-infrastructure-de-recherche-nationale)*

<div style="display: flex; justify-content: center; align-items: center; gap: 10px;">
  <img src="https://oscillo.wewenito.ddns.net/static/IMAGES/Agata1.jpg" alt="Crystals within the Agata experiment" width="400">
  <img src="https://oscillo.wewenito.ddns.net/static/IMAGES/Agata2.jpg" alt="Outside of the Agata experiment" width="400">
</div>

## 🛠️ Installation

Follow these steps to get the app up and running locally in Docker containers.

* Start by cloning this repo onto your machine
* Once the repo is cloned, open a terminal within the downloaded folder and execute the following script :

```bash
bash oscillo-setup.sh
```
> [!NOTE]
> You might need to make the script executable on your machine beforehand, use the following command to do so :

```bash
sudo chmod +x oscillo-setup.sh
```

## 🛡️ Clean up
A script is available to remove all containers and images associated with this application. Run it with:

```bash
bash cleanup.sh
```

## 📚 Documentation

Need help? Start here!

📘 Developer Docs: [View Documentation](https://oscillo.wewenito.ddns.net/static/DOCS/DOC-DEV/index.html)

📗 User Guide: [View Documentation](https://oscillo.wewenito.ddns.net/static/DOCS/module-MAIN-PAGE.html)

📙 Docker Installation Guide: [View Documentation](https://docs.docker.com/engine/install/)

## 🌍 Live Demo

Check out the live app demo running [here.](https://oscillo.wewenito.ddns.net/)

<img src="https://oscillo.wewenito.ddns.net/static/IMAGES/oscillo.png" alt="Live demo of the oscillo app" width="400">

## 🏗️ Built with

* 🐍 Django: Web Framework for Python
* 👨‍💻 Javascript: Dynamic Front-end interactions
* 🐳 Docker: Containerized deployment

## 📜 License
This software is free to use and available for anyone.
