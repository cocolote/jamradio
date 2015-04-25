class Guest < ActiveRecord::Base
  belongs_to :jam
  belongs_to :user

  validates :jam,
    presence: true,
  uniqueness: { scope: :user }

  validates :user,
    presence: true
end
