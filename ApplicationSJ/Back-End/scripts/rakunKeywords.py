from rakun2 import RakunKeyphraseDetector
# EXAMPLE_DOCUMENT = """
# Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.[a]

# The term "artificial intelligence" had previously been used to describe machines that mimic and display "human" cognitive skills that are associated with the human mind, such as "learning" and "problem-solving". This definition has since been rejected by major AI researchers who now describe AI in terms of rationality and acting rationally, which does not limit how intelligence can be articulated.[b]
# """
# hyperparameters = {"num_keywords": 10,
#                    "merge_threshold": 1.1,
#                    "alpha": 0.3,
#                    "token_prune_len": 3}

# keyword_detector = RakunKeyphraseDetector(hyperparameters)
# out_keywords = keyword_detector.find_keywords(EXAMPLE_DOCUMENT, input_type="string")
# print(out_keywords)

# print("\n\n")



# Wiki page on marsupials + wiki page on kangaroos (concatenated)
hyperparameters = {"num_keywords": 20,
                   "merge_threshold": 0.8,
                   "alpha": 0.5,
                   "token_prune_len": 2}
keyword_detector = RakunKeyphraseDetector(hyperparameters)
out_keywords = keyword_detector.find_keywords("example_syllabus.txt", input_type="file")
print(out_keywords)
