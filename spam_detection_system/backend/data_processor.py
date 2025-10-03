import pandas as pd
import numpy as np
from collections import Counter
import re

class DataProcessor:
    def __init__(self):
        self.data = None
        self.stats = {}
    
    def load_dataset(self, file_path):
        """
        Load the SMS spam collection dataset
        """
        try:
            self.data = pd.read_csv(file_path, sep='\t', header=None, names=['label', 'message'])
            self.calculate_stats()
            return True
        except Exception as e:
            print(f"Error loading dataset: {str(e)}")
            return False
    
    def calculate_stats(self):
        """
        Calculate dataset statistics
        """
        if self.data is None:
            return
        
        total_messages = len(self.data)
        spam_count = len(self.data[self.data['label'] == 'spam'])
        ham_count = len(self.data[self.data['label'] == 'ham'])
        
        # Calculate average message lengths
        avg_spam_length = self.data[self.data['label'] == 'spam']['message'].str.len().mean()
        avg_ham_length = self.data[self.data['label'] == 'ham']['message'].str.len().mean()
        
        # Most common words in spam vs ham
        spam_messages = ' '.join(self.data[self.data['label'] == 'spam']['message'].values)
        ham_messages = ' '.join(self.data[self.data['label'] == 'ham']['message'].values)
        
        spam_words = re.findall(r'\b\w+\b', spam_messages.lower())
        ham_words = re.findall(r'\b\w+\b', ham_messages.lower())
        
        spam_word_freq = Counter(spam_words).most_common(10)
        ham_word_freq = Counter(ham_words).most_common(10)
        
        self.stats = {
            'total_messages': total_messages,
            'spam_count': spam_count,
            'ham_count': ham_count,
            'spam_percentage': round((spam_count / total_messages) * 100, 2),
            'ham_percentage': round((ham_count / total_messages) * 100, 2),
            'avg_spam_length': round(avg_spam_length, 2),
            'avg_ham_length': round(avg_ham_length, 2),
            'top_spam_words': spam_word_freq,
            'top_ham_words': ham_word_freq
        }
    
    def get_stats(self):
        """
        Return dataset statistics
        """
        return self.stats
    
    def get_sample_messages(self, count=5):
        """
        Get sample spam and ham messages
        """
        if self.data is None:
            return {}
        
        spam_samples = self.data[self.data['label'] == 'spam']['message'].head(count).tolist()
        ham_samples = self.data[self.data['label'] == 'ham']['message'].head(count).tolist()
        
        return {
            'spam_samples': spam_samples,
            'ham_samples': ham_samples
        }
    
    def search_messages(self, keyword, limit=10):
        """
        Search for messages containing a keyword
        """
        if self.data is None:
            return []
        
        # Case-insensitive search
        mask = self.data['message'].str.contains(keyword, case=False, na=False)
        results = self.data[mask].head(limit)
        
        return results[['label', 'message']].to_dict('records')
