# import SentimentIntensityAnalyzer class
# from vaderSentiment.vaderSentiment module.
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# function to print sentiments
# of the sentence.
def sentiment_scores(sentence):

	# Create a SentimentIntensityAnalyzer object.
	sid_obj = SentimentIntensityAnalyzer()

	# polarity_scores method of SentimentIntensityAnalyzer
	# object gives a sentiment dictionary.
	# which contains pos, neg, neu, and compound scores.
	sentiment_dict = sid_obj.polarity_scores(sentence)
	
	print("Overall sentiment dictionary is : ", sentiment_dict)
	print("sentence was rated as ", sentiment_dict['neg']*100, "% Negative")
	print("sentence was rated as ", sentiment_dict['neu']*100, "% Neutral")
	print("sentence was rated as ", sentiment_dict['pos']*100, "% Positive")

	print("Sentence Overall Rated As", end = " ")

	# decide sentiment as positive, negative and neutral
	if sentiment_dict['compound'] >= 0.05 :
		print("Positive")

	elif sentiment_dict['compound'] <= - 0.05 :
		print("Negative")

	else :
		print("Neutral")



# Driver code
if __name__ == "__main__" :

	print("\n1st statement :")
	sentence = "My teaching philosophy is everyone can succeed in this course,\
	 and our goals are we are learning and improving together. I am dedicated to \
	 promoting the excellence, equity, and inclusion in Inorganic Chemistry education. \
		I will adopt active learning approaches in my classrooms, which have been shown to\
			 improve students learning outcomes. Based on my observations teaching this course\
				 in the past five years, active participation in the lectures, and communications\
					 with peers and the instructor provide positive impacts on students’ success. \
						Thus, I highly encourage and welcome everyone to actively participate in all\
							 the class activities, ask questions, and share your knowledge with your \
								friends and family! We expect an inclusive and judgement-free learning\
									 environment. Let’s show respect to everyone in our learning community.\
										 All questions are welcomed and feel free to ask whenever you feel \
											confused. As your instructor, I will try my best to provide the\
												 help you need. I also encourage everyone of you to talk to me at least once in the office hour during the semester"

	# function calling
	sentiment_scores(sentence)

	
