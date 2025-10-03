# Spam Detection System

A modern spam email detection system powered by Bayesian Networks with a Flask API backend and an interactive web frontend.

## Features

- **Bayesian Network Classification**: Uses Naive Bayes algorithm for accurate spam detection
- **Interactive Web Interface**: Modern, responsive design with real-time analysis
- **REST API**: Clean API endpoints for integration with other applications
- **Real-time Confidence Scores**: Shows probability scores for spam vs legitimate messages
- **Dataset Statistics**: Displays comprehensive statistics about the training data
- **Sample Messages**: Browse examples from the training dataset
- **One-Click Testing**: Quick test buttons with example messages

## Project Structure

```
spam_detection_system/
├── backend/                 # Flask API backend
│   ├── app.py              # Main Flask application
│   ├── spam_classifier.py  # Bayesian classifier implementation
│   ├── data_processor.py   # Data processing utilities
│   └── models/             # Trained model storage
├── frontend/               # Web interface
│   ├── index.html         # Main application interface
│   ├── launcher.html      # System launcher page
│   ├── style.css          # Modern CSS styling
│   └── script.js          # Interactive JavaScript
├── data/                  # Training dataset
│   └── SMSSpamCollection.txt
├── requirements.txt       # Python dependencies
├── start_backend.bat     # Windows batch file to start backend
└── README.md            # This file
```

## Quick Start

### Option 1: Using the Launcher (Recommended)
1. Open `frontend/launcher.html` in your web browser
2. Click "Start Backend & Open Application"
3. Follow the on-screen instructions

### Option 2: Manual Setup

#### Prerequisites
- Python 3.7 or higher
- Web browser (Chrome, Firefox, Safari, Edge)

#### Installation

1. **Clone or download the project**
   ```bash
   # If using git
   git clone <repository-url>
   cd spam_detection_system
   ```

2. **Install Python dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Start the backend server**
   ```bash
   python app.py
   ```
   The server will start on `http://localhost:5000`

4. **Open the frontend**
   - Open `frontend/index.html` in your web browser
   - Or use the launcher at `frontend/launcher.html`

## Usage

### First Time Setup
1. Open the web interface
2. Click "Train Model" to train the Bayesian classifier
3. Wait for training to complete (this may take a few minutes)
4. The model will be automatically saved for future use

### Analyzing Messages
1. Enter a message in the text area
2. Click "Analyze Message" or press Ctrl+Enter
3. View the results showing:
   - Spam or Ham classification
   - Confidence percentages for both categories
   - Visual progress bars

### Features Overview

#### Detection Interface
- **Message Input**: Large text area with character counter
- **Real-time Analysis**: Instant classification with confidence scores
- **Visual Results**: Color-coded badges and progress bars
- **Quick Examples**: Pre-loaded example messages for testing

#### Model Information
- **Training Status**: Shows if the model is trained and ready
- **Dataset Statistics**: Total messages, spam/ham distribution, average lengths
- **Sample Browser**: View example spam and legitimate messages

#### Interactive Elements
- **Click samples to analyze**: Click any sample message to analyze it
- **Responsive design**: Works on desktop, tablet, and mobile devices
- **Real-time status**: API connection status indicator
- **Toast notifications**: User-friendly success/error messages

## API Endpoints

The backend provides the following REST API endpoints:

### GET `/`
Returns API information and available endpoints.

### GET `/status`
Returns the current status of the model and data loading.

### POST `/predict`
Analyzes a message for spam detection.
```json
{
    "message": "Your message here"
}
```

### POST `/train`
Trains the Bayesian classifier using the dataset.

### GET `/stats`
Returns comprehensive dataset statistics.

### GET `/samples`
Returns sample spam and ham messages from the dataset.

## Technical Details

### Bayesian Network Implementation
- **Algorithm**: Multinomial Naive Bayes
- **Feature Extraction**: TF-IDF (Term Frequency-Inverse Document Frequency)
- **Text Preprocessing**: 
  - Lowercase conversion
  - URL and email removal
  - Phone number filtering
  - Stopword removal
  - Porter stemming
  - Special character removal

### Dataset
- **Source**: SMS Spam Collection Dataset
- **Size**: 5,575 messages
- **Distribution**: ~13% spam, ~87% legitimate
- **Format**: Tab-separated values (label, message)

### Performance Features
- **Model Persistence**: Trained models are saved and automatically loaded
- **Efficient Processing**: Vectorized text processing for fast predictions
- **Memory Optimization**: Streaming data processing for large datasets

## Customization

### Adding New Features
1. **Backend**: Add new endpoints in `app.py`
2. **Frontend**: Modify `script.js` for new functionality
3. **Styling**: Update `style.css` for visual changes

### Using Different Datasets
1. Replace `data/SMSSpamCollection.txt` with your dataset
2. Ensure the format is: `label<TAB>message`
3. Labels should be 'spam' or 'ham'
4. Retrain the model using the web interface

### Configuration
Modify the following variables in `script.js`:
- `API_BASE_URL`: Change the backend server URL
- `exampleMessages`: Add your own example messages

## Troubleshooting

### Common Issues

**Backend won't start**
- Check Python installation: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check port 5000 isn't already in use

**Frontend can't connect to API**
- Ensure backend is running on `http://localhost:5000`
- Check browser console for CORS errors
- Verify firewall isn't blocking the connection

**Model training fails**
- Check if `data/SMSSpamCollection.txt` exists
- Ensure the dataset format is correct
- Check available memory (training requires ~500MB)

**Poor accuracy results**
- Retrain the model with "Train Model" button
- Check if the dataset is corrupted
- Ensure sufficient training data

### Browser Compatibility
- **Recommended**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Required Features**: ES6, Fetch API, CSS Grid, Flexbox

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- SMS Spam Collection Dataset from UCI Machine Learning Repository
- Flask framework for the REST API
- Scikit-learn for machine learning algorithms
- Font Awesome for icons
- Google Fonts for typography
